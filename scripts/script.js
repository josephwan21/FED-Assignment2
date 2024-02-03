document.addEventListener("DOMContentLoaded", function () {
    document.body.style.opacity = 1;
});

let triviaTopic = "general-knowledge";
const topicRadio = document.getElementById("topic-radio");

topicRadio.addEventListener("change", updateTopic);

function updateTopic(event) {
    console.log(event.target.value);
}

document.getElementById("start-trivia-button").onclick = function () {
    location.href = "trivia.html";
};
