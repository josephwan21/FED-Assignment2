document.addEventListener("DOMContentLoaded", function () {
    // Fade-in
    document.body.style.opacity = 1;
    const APIKEY = "65c246cb514d3948545fda29";
    const xpNeeded = {
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

    // let triviaTopic = "general-knowledge";
    let triviaTopic = document.querySelector(
        'input[name="category-options-base"]:checked'
    ).value;
    let triviaDifficulty = document.querySelector(
        'input[name="difficulty-options-base"]:checked'
    ).value;

    const topicRadio = document.getElementById("category-radio");
    topicRadio.addEventListener("change", updateTopic);
    function updateTopic(event) {
        document
            .querySelector(".animation-visible")
            .classList.remove("animation-visible");
        document
            .getElementById(event.target.value + "-animation")
            .classList.add("animation-visible");
        triviaDifficulty = document.querySelector(
            'input[name="difficulty-options-base"]:checked'
        ).value;
        triviaTopic = document.querySelector(
            'input[name="category-options-base"]:checked'
        ).value;
    }

    const leaderboardBody = document.getElementById("leaderboard-body");
    //Clear existing rows
    // leaderboardBody.innerHTML = "";
    //Function to update leaderboard modal content
    function updateLeaderboardModal(data) {
        leaderboardBody.innerHTML = "";
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
            });
    }
    // fetchLeaderboardData(APIKEY); // Fetch and update leaderboard data when the page loads

    document
        .querySelector(".leaderboard-button")
        .addEventListener("click", function () {
            fetchLeaderboardData(APIKEY);
        });

    //Retrieve user (log-in) information from sessionStorage
    const userData = sessionStorage.getItem("user");

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

        // Set a new timeout
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
                } else {
                    console.error("User not found for update");
                }
            } catch (error) {
                console.error("Error updating profile:", error);
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
