document.addEventListener("DOMContentLoaded", function () {
    // enable bootstrap tooltips
    const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
    );
    const tooltipList = [...tooltipTriggerList].map(
        (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );

    // Fade-in
    document.body.style.opacity = 1;

    const APIKEY = "65c246cb514d3948545fda29";
    // levels
    const xpNeeded = {
        1: 0,
        2: 20,
        3: 60,
        4: 140,
        5: 300,
        6: 620,
        7: 1260,
        8: 2540,
        9: 5100,
        10: 10220,
        11: 20440,
        12: 40920,
        13: 81880,
        14: 81880,
    };

    // radio button selection
    let triviaTopic = document.querySelector(
        'input[name="category-options-base"]:checked'
    ).value;
    let triviaDifficulty = document.querySelector(
        'input[name="difficulty-options-base"]:checked'
    ).value;

    const topicRadio = document.getElementById("category-radio");
    topicRadio.addEventListener("change", updateTopic); // retrieve the selected category
    function updateTopic(event) {
        document
            .querySelector(".animation-visible")
            .classList.remove("animation-visible");
        document
            .getElementById(event.target.value + "-animation")
            .classList.add("animation-visible");

        triviaTopic = document.querySelector(
            'input[name="category-options-base"]:checked'
        ).value;
    }

    const difficultyRadio = document.getElementById("difficulty-radio");
    difficultyRadio.addEventListener("change", updateDifficulty); // retrieve the selected difficulty
    function updateDifficulty(event) {
        triviaDifficulty = document.querySelector(
            'input[name="difficulty-options-base"]:checked'
        ).value;
    }

    const leaderboardBody = document.getElementById("leaderboard-body");

    //Function to update leaderboard modal content
    function updateLeaderboardModal(data) {
        leaderboardBody.innerHTML = ""; // clear existing rows
        //Iterate through the fetched data and create new rows
        data.forEach((user, index) => {
            leaderboardBody.innerHTML += `
            <tr>
                <th scope="row">${index + 1}</th>
                <td>${user.name}</td>
                <td>${user.trophies}</td>
            </tr>
            `;
        });
    }

    // Function to fetch leaderboard data and update modal
    function fetchLeaderboardData(key) {
        fetch("https://fedassg2-4ddb.restdb.io/rest/accounts", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": key,
                "Cache-Control": "no-cache",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                // Sort data by trophies in descending order
                data.sort((a, b) => b.trophies - a.trophies);
                // Update modal with the sorted leaderboard data
                updateLeaderboardModal(data);
            })
            .catch((error) => {
                console.error("Error fetching leaderboard data:", error);
                document.getElementById(
                    "leaderboard-error-message"
                ).style.display = "block";
                document.getElementById("load-leaderboard").style.display =
                    "none";
            });
    }
    // fetchLeaderboardData(APIKEY); // Fetch and update leaderboard data when the page loads

    document
        .querySelector(".leaderboard-button")
        .addEventListener("click", function () {
            fetchLeaderboardData(APIKEY);
        });

    //Retrieve user (log-in) information from sessionStorage

    let userData = sessionStorage.getItem("user");

    if (userData) {
        const user = JSON.parse(userData);

        // Check user XP and update level if necessary
        if (user.xp < 20) user.level = 1;
        else if (user.xp < 60) user.level = 2;
        else if (user.xp < 140) user.level = 3;
        else if (user.xp < 300) user.level = 4;
        else if (user.xp < 620) user.level = 5;
        else if (user.xp < 1260) user.level = 6;
        else if (user.xp < 2540) user.level = 7;
        else if (user.xp < 5100) user.level = 8;
        else if (user.xp < 10220) user.level = 9;
        else if (user.xp < 20440) user.level = 10;
        else if (user.xp < 40920) user.level = 11;
        else if (user.xp < 81880) user.level = 12;
        else user.level = 13;

        // enable any radio buttons and remove tooltips for unlocked items
        for (let level = 2; level <= user.level; level++) {
            for (let unlocked of document.getElementsByClassName(
                `level-${level}`
            )) {
                unlocked.disabled = false;
            }

            for (let unlockedLabel of document.getElementsByClassName(
                `level-${level}-label`
            )) {
                bootstrap.Tooltip.getOrCreateInstance(unlockedLabel).disable();
            }
        }

        // update session storage
        sessionStorage.setItem("user", JSON.stringify(user));

        // set min max values of level bar to display
        document.getElementById("level-bar").ariaValueNow = user.xp;
        document.getElementById("level-bar").ariaValueMax =
            xpNeeded[user.level + 1];
        document.getElementById("level-bar").ariaValueMin =
            xpNeeded[user.level];
        document.getElementById(
            "level-bar"
        ).innerHTML = `<div class="progress-bar progress-bar-striped progress-bar-animated" style="width: ${
            ((user.xp - xpNeeded[user.level]) /
                (xpNeeded[user.level + 1] - xpNeeded[user.level])) *
            100
        }%;" >Level ${user.level}</div>`;
    }

    userData = sessionStorage.getItem("user");

    //Check if user data exists
    if (userData) {
        const user = JSON.parse(userData);

        // Update profile modal with user data
        document.getElementById("profile-name").value = user.name;
        document.getElementById("profile-email").value = user.email;
        document.getElementById("profile-level").innerText = user.level;
        document.getElementById("profile-xp").innerText =
            user.xp + " / " + xpNeeded[user.level + 1] + " XP";
        document.getElementById("profile-trophies").innerText =
            user.trophies + " Trophies";
        //Attach an input event listener to each text box
        document
            .getElementById("profile-name")
            .addEventListener("input", function () {
                updateProfileInDatabase(
                    user.name,
                    user.email,
                    this.value,
                    document.getElementById("profile-email").value
                );
            });

        document
            .getElementById("profile-email")
            .addEventListener("input", function () {
                updateProfileInDatabase(
                    user.name,
                    user.email,
                    document.getElementById("profile-name").value,
                    this.value
                );
            });
    }

    let updateTimeout; // Variable to store the timeout for updating user credentials
    //Had to do an asynchronous function to ensure when the user changes his name/email, the database finds the previous username/email rather than the one that was recently changed.
    async function updateProfileInDatabase(name, email, newName, newEmail) {
        // Clear any existing timeout
        clearTimeout(updateTimeout);

        // Set a new timeout for updating user credentials
        updateTimeout = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://fedassg2-4ddb.restdb.io/rest/accounts?q={"name": "${name}", "email": "${email}"}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "x-apikey": APIKEY,
                        },
                    }
                );
                const data = await response.json();

                // Find the exact user match based on name and email
                const matchingUser = data.find(
                    (user) => user.name === name && user.email === email
                );

                if (matchingUser) {
                    let userID = matchingUser._id; //Check if there's a matching user

                    // Update the user's profile in the database
                    const updateResponse = await fetch(
                        `https://fedassg2-4ddb.restdb.io/rest/accounts/${userID}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "x-apikey": APIKEY,
                            },
                            body: JSON.stringify({
                                name: newName,
                                email: newEmail,
                            }),
                        }
                    );

                    const updateData = await updateResponse.json();
                    console.log(updateData);

                    // Update sessionStorage
                    const updatedUser = {
                        ...matchingUser,
                        name: newName,
                        email: newEmail,
                    };

                    sessionStorage.setItem("user", JSON.stringify(updatedUser));
                } else {
                    console.error("User not found for update");
                    document.getElementById(
                        "updateacc-error-message"
                    ).style.display = "block"; //Should there be any errors that occur, a message should pop up.
                }
            } catch (error) {
                console.error("Error updating profile:", error);
                document.getElementById(
                    "updateacc-error-message"
                ).style.display = "block";
            }
        }, 7500); // 7500 milliseconds delay before changing the name & email field of the selected user to avoid going past the rate limit of the database
    }

    //If Start button is pressed, users get redirected to the trivia.html page to start the trivia quiz
    document.getElementById("start-trivia-button").onclick = function () {
        sessionStorage.setItem("trivia-topic", triviaTopic);
        sessionStorage.setItem("trivia-difficulty", triviaDifficulty);
        location.href = "trivia.html";
    };
});
