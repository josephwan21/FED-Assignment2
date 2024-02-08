document.addEventListener("DOMContentLoaded", function () {
    // Fade-in
    document.body.style.opacity = 1;

    const APIKEY = "65c246cb514d3948545fda29";

    // Function to handle create account form submission
    function handleCreateAccount() {
        let createEmail = document
            .getElementById("create-email")
            .value.toLowerCase(); //Set email to lowercase to accept emails that may have capitalised letters in it 
        let createName = document.getElementById("create-username").value;  //Value of name in account creation
        let createPassword = document.getElementById("create-password").value; //Value of password in account creation

        //Assign values to the JSON in the database
        let jsondata = {
            email: createEmail,
            name: createName,
            password: createPassword,
            xp: 0,
            level: 0,
            trophies: 0,
        };
        //Assign settings to perform a POST request
        let settings = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": APIKEY,
            },
            body: JSON.stringify(jsondata),
            beforeSend: function () {
                document.getElementById("create-btn").disabled = true;
                document.getElementById("createacc-form").reset();
            },
        };
        
        //When creating an account again, turn off the success message
        document.getElementById("success-message").style.display = "none";
        fetch("https://fedassg2-4ddb.restdb.io/rest/accounts", settings)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                document.getElementById("create-btn").disabled = false;
                // Success message shown if account is successfully created.
                document.getElementById("success-message").style.display =
                    "block";
            })
            //Should there be an errors found, display it in the console and in the page for the user to see as well.
            .catch((error) => {
                console.error("Account creation failed:", error);
                document.getElementById("acc-error-message").style.display = "block";
            });
    }

    document
        .getElementById("createacc-form")
        .addEventListener("submit", function (e) {
            e.preventDefault(); //Prevent default action of form submission
            handleCreateAccount(); //Call function
        });

    // Sign in form submission handling code...
    function handleSignIn() {
        let signInInput = document.getElementById("username").value;
        let signInPassword = document.getElementById("password").value;

        let EmailFormat = signInInput.includes("@"); //Checks whether there's an '@' in the sign in input to indicate whether it is a name or email.

        let jsondata;
        //Assigning values to the database
        if (EmailFormat) {
            jsondata = {
                email: signInInput.toLowerCase(),
                password: signInPassword,
            };
        } else {
            jsondata = {
                name: signInInput,
                password: signInPassword,
            };
        }
        //Assigning settings to perform a GET request
        let settings = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": APIKEY,
                "Cache-Control": "no-cache",
            },
        };
        //If user tries to sign in again, the invalid username or email message should be turned off and reappear if the inputs are still invalid.
        document.getElementById("invalid-message").style.display = "none";
        fetch(
            `https://fedassg2-4ddb.restdb.io/rest/accounts?q=${JSON.stringify(
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

                    sessionStorage.setItem("user", JSON.stringify(data[0]));

                    // Display personalized welcome message
                    document.getElementById("welcome-message").style.display =
                        "block";
                    document.getElementById(
                        "welcome-message"
                    ).innerText = `Welcome, ${username}!`;

                    document.getElementById("signin-form").reset(); //Form clears after successfully signing in

                    //Redirect to games.html
                    setTimeout(function () {
                        location.href = "games.html";
                    }, 2000);
                } else {
                    // No matching entries, show error message
                    document.getElementById("invalid-message").style.display =
                        "block";
                    console.error("Invalid username or password.");
                }
            })
            //Should there be any errors that occur, error message should pop up in both the console and the webpage for the user to be notified by it.
            .catch((error) => {
                console.error("Error during sign-in:", error);
                document.getElementById("signin-error-message").style.display = "block";
            });
    }
    //Handle sign in function is called when user presses the Sign In button
    document
        .getElementById("signin-form")
        .addEventListener("submit", function (e) {
            e.preventDefault();
            handleSignIn();
        });
});
