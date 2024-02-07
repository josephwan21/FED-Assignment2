document.addEventListener("DOMContentLoaded", function () {
    let nextButton = document.querySelector("#next-qn-button");

    nextButton.innerHTML = "NEXT";
    nextButton.disabled = true; // prevent user from clicking next before questions are fetched

    const APIKEY = "65c246cb514d3948545fda29";
    const userData = JSON.parse(sessionStorage.getItem("user"));
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
            nextButton.disabled = false;
            console.log(data);

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
                    if (index === amount) {
                        nextButton.innerHTML = "FINISH";
                    }
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
                    console.log(document.getElementById("triviaModal"));
                    let modal = bootstrap.Modal.getOrCreateInstance(
                        document.getElementById("triviaModal")
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

                    updateXpAndTrophiesInDatabase(
                        userData.name,
                        userData.email,
                        userData.level,
                        2 * score,
                        2 * score
                    ); // Update XP and trophies in the database
                    modal.show();
                    window.removeEventListener(
                        "beforeunload",
                        alertBeforeUnloading
                    );
                    document
                        .getElementById("ok")
                        .addEventListener("click", function () {
                            location.href = "games.html";
                        });
                }
            });
        });

    // Function to update XP and trophies in the database
    function updateXpAndTrophiesInDatabase(
        name,
        email,
        level,
        xpIncrement,
        trophiesIncrement
    ) {
        fetch(
            `https://fedassg2-4ddb.restdb.io/rest/accounts?q={"name": "${name}", "email": "${email}"}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": APIKEY,
                },
            }
        )
            .then((response) => response.json())
            .then((data) => {
                if (data.length > 0) {
                    let userID = data[0]._id;

                    let currentXP = data[0].xp;
                    let currentTrophies = data[0].trophies;

                    let updatedXP = currentXP + xpIncrement;
                    let updatedTrophies = currentTrophies + trophiesIncrement;

                    // Update XP and trophies in the database
                    fetch(
                        `https://fedassg2-4ddb.restdb.io/rest/accounts/${userID}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "x-apikey": APIKEY,
                            },
                            body: JSON.stringify({
                                xp: updatedXP,
                                trophies: updatedTrophies,
                                level: level,
                            }),
                        }
                    )
                        .then((response) => response.json())
                        .then((data) => {
                            console.log(data);

                            const updatedUserData = {
                                name: name,
                                email: email,
                                level: level,
                                xp: updatedXP,
                                trophies: updatedTrophies,
                            };

                            sessionStorage.setItem(
                                "user",
                                JSON.stringify(updatedUserData)
                            );
                        })
                        .catch((error) => {
                            console.error(
                                "Error updating XP and trophies:",
                                error
                            );
                        });
                } else {
                    console.error("User not found for XP and trophies update");
                }
            })
            .catch((error) => {
                console.error(
                    "Error finding user for XP and trophies update:",
                    error
                );
            });
    }
});

let alertBeforeUnloading = function (event) {
    // Cancel the event
    event.preventDefault();
    event.returnValue = "";
};

window.addEventListener("beforeunload", alertBeforeUnloading);
