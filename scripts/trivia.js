document.addEventListener("DOMContentLoaded", function () {
    let nextButton = document.querySelector("#next-qn-button");

    nextButton.innerHTML = "NEXT";
    nextButton.disabled = true; // prevent user from clicking next before questions are fetched

    const APIKEY = "65c246cb514d3948545fda29";
    const userData = JSON.parse(sessionStorage.getItem("user"));

    // Fade-in
    document.body.style.opacity = 1;

    // Initialisation of trivia details
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
    let multipliers = {
        easy: 2,
        medium: 4,
        hard: 6,
    };

    // Retrieve selected category and difficulty
    let triviaTopic = sessionStorage.getItem("trivia-topic");
    let triviaDifficulty = sessionStorage.getItem("trivia-difficulty");
    let difficultyMultiplier = multipliers[triviaDifficulty];

    // display trivia category and name
    document.getElementById("category-name").innerHTML =
        triviaTopic.replaceAll("-", " ") + " - " + triviaDifficulty;
    document.getElementById("category-name").style.textTransform = "capitalize";
    let index = 1; // starting question number

    function loadQuestion(data) {
        document.getElementById("question-number").innerHTML = index; // display question number
        document.getElementById("question").innerHTML =
            data.results[index - 1].question; // display question

        // set options of question
        let options = [];
        if (data.results[index - 1].type === "multiple") {
            options = data.results[index - 1].incorrect_answers.slice(); // make a copy of the incorrect answers array from the question object
            options.push(data.results[index - 1].correct_answer); // add correct answer to options

            // randomise options
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }
        } else if (data.results[index - 1].type === "boolean") {
            options.push("True");
            options.push("False");
        }

        for (let option of document.getElementsByClassName("multiple")) {
            option.style.display = "none"; // remove all option buttons
        }

        // display the number of option buttons needed
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
    }

    // fetch 10 questions of chosen category and difficulty
    fetch(
        `https://opentdb.com/api.php?amount=${amount}&category=${topicNumbers[triviaTopic]}&difficulty=${triviaDifficulty}`,
        {
            method: "GET",
        }
    )
        .then((response) => response.json())
        .then((data) => {
            // enable next button
            nextButton.disabled = false;

            // load first question
            loadQuestion(data);

            nextButton.addEventListener("click", function () {
                // check if user selected anything
                if (
                    document.querySelector('input[name="choice"]:checked') ===
                    null
                ) {
                    return;
                }
                // check if reached set number of questions
                if (index < amount) {
                    // check if selected answer is correct
                    if (
                        document.querySelector('input[name="choice"]:checked')
                            .value === data.results[index - 1].correct_answer
                    ) {
                        score++;
                    }

                    // uncheck selected option for next question
                    document.querySelector(
                        'input[name="choice"]:checked'
                    ).checked = false;
                    index++; // increase question number
                    // change next button to finish button
                    if (index === amount) {
                        nextButton.innerHTML = "FINISH";
                    }
                    // load next question on Next pressed
                    loadQuestion(data);
                } else {
                    // check answer of last question
                    if (
                        document.querySelector('input[name="choice"]:checked')
                            .value === data.results[index - 1].correct_answer
                    ) {
                        score++;
                    }
                    // disable next button
                    nextButton.disabled = true;

                    // create result modal
                    let modal = bootstrap.Modal.getOrCreateInstance(
                        document.getElementById("triviaModal")
                    );
                    // add results to content
                    document.querySelector(
                        ".modal-body"
                    ).innerHTML = `${(document.getElementById(
                        "category-name"
                    ).innerHTML = triviaTopic.replaceAll(
                        "-",
                        " "
                    ))}<br />Score: ${score}/10<br />+${
                        difficultyMultiplier * score
                    } Trophies<br />+${difficultyMultiplier * score} XP`;

                    updateXpAndTrophiesInDatabase(
                        userData.name,
                        userData.email,
                        userData.level,
                        difficultyMultiplier * score,
                        difficultyMultiplier * score
                    ); // Update XP and trophies in the database
                    modal.show(); // display modal
                    window.removeEventListener(
                        "beforeunload",
                        alertBeforeUnloading
                    ); // remove the alert when leaving page
                    document
                        .getElementById("ok")
                        .addEventListener("click", function () {
                            location.href = "games.html"; // go back to home page
                        });
                }
            });
        });

    // Function to update XP and trophies in the database & its necessary parameters
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

                    let currentXP = data[0].xp; //Current XP & trophies gathered from database
                    let currentTrophies = data[0].trophies;

                    let updatedXP = currentXP + xpIncrement; //Add currentXP & trophies with their respective increments from the score gained from the quiz
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
                            //Apply updatedXP, trophies and current level to the database
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
                            //Once XP & trophies have been updated, update the sessionStorage as well
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
                            document.getElementById(
                                "XPnTrophy-error-message"
                            ).style.display = "block"; //Should there be any errors that occur, this message should appear.
                        });
                } else {
                    console.error("User not found for XP and trophies update");
                    document.getElementById(
                        "XPnTrophy-error-message"
                    ).style.display = "block";
                }
            })
            .catch((error) => {
                console.error(
                    "Error finding user for XP and trophies update:",
                    error
                );
                document.getElementById(
                    "XPnTrophy-error-message"
                ).style.display = "block";
            });
    }
});

// prevent user from accidentally leaving page and losing trivia progress
let alertBeforeUnloading = function (event) {
    // Cancel the event
    event.preventDefault();
    event.returnValue = "";
};

window.addEventListener("beforeunload", alertBeforeUnloading);
