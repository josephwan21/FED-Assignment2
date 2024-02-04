document.addEventListener("DOMContentLoaded", function () {
    // Fade-in
    document.body.style.opacity = 1;

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
    //If Start button is pressed, users get redirected to the trivia.html page to start the trivia quiz
    document.getElementById("start-trivia-button").onclick = function () {
        location.href = "trivia.html";
    };
});
