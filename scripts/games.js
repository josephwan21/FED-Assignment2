document.addEventListener("DOMContentLoaded", function () {
    // Fade-in
    document.body.style.opacity = 1;
    const APIKEY = "65bde72ec029b8514466ce5b";

    let triviaTopic = "general-knowledge";
    const topicRadio = document.getElementById("category-radio");
    topicRadio.addEventListener("change", updateTopic);
    function updateTopic(event) {
        document
            .querySelector(".animation-visible")
            .classList.remove("animation-visible");
        document
            .getElementById(event.target.value + "-animation")
            .classList.add("animation-visible");
    }
    
    const leaderboardBody = document.getElementById("leaderboard-body");
    //Clear existing rows
    leaderboardBody.innerHTML = "";
    //Function to update leaderboard modal content
    function updateLeaderboardModal(data) {
        //Iterate through the fetched data and create new rows
        data.forEach((user, index) => {
            leaderboardBody.innerHTML += `
            <tr>
                <th scope="row">${index + 1}</th>
                <td>${user.name}</td>
                <td>${user.trophies}</td>
            </tr>`;
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
    fetchLeaderboardData(APIKEY); // Fetch and update leaderboard data when the page loads

    //If Start button is pressed, users get redirected to the trivia.html page to start the trivia quiz
    document.getElementById("start-trivia-button").onclick = function () {
        location.href = "trivia.html";
    };
});
