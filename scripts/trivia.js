document.addEventListener("DOMContentLoaded", function () {
    let nextButton = document.querySelector(".next-btn");
    nextButton.disabled = true; // prevent user from clicking next before questions are fetched

    // Fade-in
    document.body.style.opacity = 1;

    let score = 0;
    let amount = 10;
    let topicNumbers = {
        "general-knowledge": 9,
        computers: 18,
        geography: 22,
        history: 23,
        "board-games": 16,
        "video-games": 15,
        vehicles: 28,
        politics: 24,
    };

    let triviaTopic = sessionStorage.getItem("trivia-topic");
    let triviaDifficulty = sessionStorage.getItem("trivia-difficulty");
    document.getElementById("category-name").innerHTML = triviaTopic.replaceAll(
        "-",
        " "
    );
    document.getElementById("category-name").style.textTransform = "capitalize";
    let index = 1;

    function loadQuestion(data) {
        document.getElementById("question-number").innerHTML = index;
        document.getElementById("question").innerHTML =
            data.results[index - 1].question;
        console.log(data.results[index - 1]);

        let options = [];
        if (data.results[index - 1].type === "multiple") {
            options = data.results[index - 1].incorrect_answers.slice(); // make a copy of the incorrect answers array from the question object
            options.push(data.results[index - 1].correct_answer);

            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }
        } else if (data.results[index - 1].type === "boolean") {
            options.push("True");
            options.push("False");
        }

        console.log(document.getElementsByClassName("multiple"));
        for (let option of document.getElementsByClassName("multiple")) {
            option.style.display = "none";
        }

        for (
            let i = 0;
            i <
            document.getElementsByClassName(data.results[index - 1].type)
                .length;
            i++
        ) {
            document.getElementsByClassName(data.results[index - 1].type)[
                i
            ].innerHTML = `<input
                type="radio"
                name="choice"
                value="${options[i]}"
            />
            &emsp;${options[i]}`;
            document.getElementsByClassName(data.results[index - 1].type)[
                i
            ].style.display = "block";
        }
        console.log(options);
    }

    fetch(
        `https://opentdb.com/api.php?amount=${amount}&category=${topicNumbers[triviaTopic]}&difficulty=${triviaDifficulty}`,
        {
            method: "GET",
        }
    )
        .then((response) => response.json())
        .then((data) => {
            nextButton.disabled = true;
            console.log(data);

            // load first question
            // document.getElementById("question-number").innerHTML = index;
            // document.getElementById("question").innerHTML =
            //     data.results[index - 1].question;
            // console.log(data.results[index - 1]);

            // let options = [];
            // if (data.results[index - 1].type === "multiple") {
            //     options = data.results[index - 1].incorrect_answers.slice(); // make a copy of the incorrect answers array from the question object
            //     options.push(data.results[index - 1].correct_answer);

            //     for (let i = options.length - 1; i > 0; i--) {
            //         const j = Math.floor(Math.random() * (i + 1));
            //         [options[i], options[j]] = [options[j], options[i]];
            //     }
            // } else if (data.results[index - 1].type === "boolean") {
            //     options.push("True");
            //     options.push("False");
            // }

            // console.log(document.getElementsByClassName("multiple"));
            // for (let option of document.getElementsByClassName("multiple")) {
            //     option.style.display = "none";
            // }

            // for (
            //     let i = 0;
            //     i <
            //     document.getElementsByClassName(data.results[index - 1].type)
            //         .length;
            //     i++
            // ) {
            //     document.getElementsByClassName(data.results[index - 1].type)[
            //         i
            //     ].innerHTML = `<input
            //     type="radio"
            //     name="choice"
            //     value="${options[i]}"
            // />
            // &emsp;${options[i]}`;
            //     document.getElementsByClassName(data.results[index - 1].type)[
            //         i
            //     ].style.display = "block";
            // }
            // console.log(options);

            // index++;
            loadQuestion(data);

            nextButton.addEventListener("click", function () {
                if (
                    document.querySelector('input[name="choice"]:checked') ===
                    null
                ) {
                    return;
                }
                if (index < amount) {
                    // check if user selected an option already
                    if (
                        document.querySelector('input[name="choice"]:checked')
                            .value === data.results[index - 1].correct_answer
                    ) {
                        console.log("Correct");
                        score++;
                    }
                    console.log(data.results[index - 1].correct_answer);
                    console.log(
                        document.querySelector('input[name="choice"]:checked')
                            .value
                    );
                    document.querySelector(
                        'input[name="choice"]:checked'
                    ).checked = false;
                    index++;
                    // load subsequent questions on Next pressed
                    // console.log(data.results[index - 1]);
                    // console.log(index);
                    // document.getElementById("question-number").innerHTML =
                    //     index;
                    // document.getElementById("question").innerHTML =
                    //     data.results[index - 1].question;
                    // index++;
                    loadQuestion(data);
                } else {
                    nextButton.disabled = true;
                    console.log(score);
                    console.log(document.getElementById("exampleModal"));
                    let modal = bootstrap.Modal.getOrCreateInstance(
                        document.getElementById("exampleModal")
                    );
                    document.querySelector(
                        ".modal-body"
                    ).innerHTML = `${(document.getElementById(
                        "category-name"
                    ).innerHTML = triviaTopic.replaceAll(
                        "-",
                        " "
                    ))}<br />Score: ${score}/10<br />+${
                        2 * score
                    } Trophies<br />+${2 * score} XP`;
                    modal.show();
                    document
                        .getElementById("ok")
                        .addEventListener("click", function () {
                            location.href = "games.html";
                        });
                }
            });
        });
});

// window.addEventListener("beforeunload", function (e) {
//     // Cancel the event
//     e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
//     // Chrome requires returnValue to be set
//     e.returnValue = "";
// });
