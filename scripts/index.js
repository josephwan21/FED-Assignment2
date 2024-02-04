document.addEventListener("DOMContentLoaded", function () {
    // Fade-in
    document.body.style.opacity = 1;

    const APIKEY = "65bde72ec029b8514466ce5b";

    // Function to handle create account form submission
    function handleCreateAccount() {
        let createEmail = document.getElementById("create-email").value;
        let createName = document.getElementById("create-username").value;
        let createPassword = document.getElementById("create-password").value;

        let jsondata = {
            email: createEmail,
            name: createName,
            password: createPassword,
        };

        let settings = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": APIKEY,
                // "Cache-Control": "no-cache",
            },
            body: JSON.stringify(jsondata),
            beforeSend: function () {
                document.getElementById("create-btn").disabled = true;
                document.getElementById("createacc-form").reset();
            },
        };

        document.getElementById("email-error-message").innerText = "";
        document.getElementById("success-message").innerText = "";
        fetch("https://fedassg2-4ddb.restdb.io/rest/log-in-info", settings)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                document.getElementById("create-btn").disabled = false;
                // Success message shown if account is successfully created.
                document.getElementById("success-message").innerText =
                    "Account created successfully!";
            });
    }

    // Attach the form submission handler
    document
        .getElementById("createacc-form")
        .addEventListener("submit", function (e) {
            e.preventDefault();
            handleCreateAccount();
            console.log("WOrking");
        });

    // Sign in form submission handling code...
    function handleSignIn() {
        let signInInput = document.getElementById("username").value;
        let signInPassword = document.getElementById("password").value;

        let EmailFormat = signInInput.includes("@");

        let jsondata;

        if (EmailFormat) {
            jsondata = {
                email: signInInput,
                password: signInPassword,
            };
        } else {
            jsondata = {
                name: signInInput,
                password: signInPassword,
            };
        }

        let settings = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": APIKEY,
                "Cache-Control": "no-cache",
            },
        };

        document.getElementById("invalid-message").innerText = "";
        fetch(
            `https://fedassg2-4ddb.restdb.io/rest/log-in-info?q=${JSON.stringify(
                jsondata
            )}`,
            settings
        )
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                // Check if any matching entries in the database were found
                if (data.length > 0) {
                    // Successful sign-in, display update message
                    console.log("Sign-in successful!");

                    let username = data[0].name;

                    // Display personalized welcome message
                    document.getElementById(
                        "welcome-message"
                    ).innerText = `Welcome, ${username}!`;

                    document.getElementById("signin-form").reset();

                    //Redirect to games.html
                    setTimeout(function () {
                        location.href = "games.html";
                    }, 2000);
                } else {
                    // No matching entries, show error message
                    document.getElementById("invalid-message").innerText =
                        "Invalid username or password.";
                    console.error("Invalid username or password.");
                }
            })
            .catch((error) => {
                console.error("Error during sign-in:", error);
            });
    }

    document
        .getElementById("signin-form")
        .addEventListener("submit", function (e) {
            e.preventDefault();
            handleSignIn();
        });
});
