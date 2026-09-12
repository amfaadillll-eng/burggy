/* =========================================================
   BURGGY
   LOGIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIG
    ====================================================== */

    const API_URL = "http://localhost:5000/api/users/login";


    /* =====================================================
       ELEMENTS
    ====================================================== */

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginMessage = document.getElementById("loginMessage");
    const loginButton = loginForm
        ? loginForm.querySelector('button[type="submit"]')
        : null;


    /* =====================================================
       CHECK FORM
    ====================================================== */

    if (!loginForm) {
        console.warn("Burggy: login form not found.");
        return;
    }


    /* =====================================================
       HELPERS
    ====================================================== */

    function showMessage(message, type = "error") {

        if (!loginMessage) return;

        loginMessage.textContent = message;

        loginMessage.classList.remove(
            "show",
            "success",
            "error"
        );

        loginMessage.classList.add(
            "show",
            type
        );
    }


    function clearMessage() {

        if (!loginMessage) return;

        loginMessage.textContent = "";

        loginMessage.classList.remove(
            "show",
            "success",
            "error"
        );
    }


    function setLoading(isLoading) {

        if (!loginButton) return;

        if (isLoading) {

            loginButton.disabled = true;

            loginButton.classList.add("loading");

            loginButton.innerHTML = `
                <span>Signing in...</span>
                <i class="fa-solid fa-spinner fa-spin"></i>
            `;

        } else {

            loginButton.disabled = false;

            loginButton.classList.remove("loading");

            loginButton.innerHTML = `
                <span>Login to Burggy</span>
                <i class="fa-solid fa-arrow-right"></i>
            `;
        }
    }


    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }


    function isValidPassword(password) {

        return password.length >= 6;
    }


    /* =====================================================
       INPUT EVENTS
    ====================================================== */

    if (emailInput) {

        emailInput.addEventListener("input", () => {

            emailInput.value = emailInput.value.trim();

            clearMessage();

        });

    }


    if (passwordInput) {

        passwordInput.addEventListener("input", () => {

            clearMessage();

        });

    }


    /* =====================================================
       LOGIN
    ====================================================== */

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearMessage();


        /* -------------------------------------------------
           GET VALUES
        ------------------------------------------------- */

        const email = emailInput
            ? emailInput.value.trim().toLowerCase()
            : "";

        const password = passwordInput
            ? passwordInput.value
            : "";


        /* -------------------------------------------------
           VALIDATION
        ------------------------------------------------- */

        if (!email) {

            showMessage(
                "Please enter your email address."
            );

            emailInput?.focus();

            return;
        }


        if (!isValidEmail(email)) {

            showMessage(
                "Please enter a valid email address."
            );

            emailInput?.focus();

            return;
        }


        if (!password) {

            showMessage(
                "Please enter your password."
            );

            passwordInput?.focus();

            return;
        }


        if (!isValidPassword(password)) {

            showMessage(
                "Password must be at least 6 characters."
            );

            passwordInput?.focus();

            return;
        }


        /* -------------------------------------------------
           LOADING
        ------------------------------------------------- */

        setLoading(true);


        try {

            /* =============================================
               API REQUEST
            ============================================== */

            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })

            });


            /* =============================================
               RESPONSE
            ============================================== */

            let data = {};

            try {

                data = await response.json();

            } catch (jsonError) {

                data = {};

            }


            /* =============================================
               SUCCESS
            ============================================== */

            if (response.ok) {

                /* -----------------------------------------
                   SAVE AUTH DATA
                ------------------------------------------ */

                if (data.token) {

                    localStorage.setItem(
                        "burggyToken",
                        data.token
                    );
                }


                if (data.user) {

                    localStorage.setItem(
                        "burggyUser",
                        JSON.stringify(data.user)
                    );
                }


                /* -----------------------------------------
                   OPTIONAL REMEMBER ME
                ------------------------------------------ */

                const rememberMe =
                    document.getElementById("rememberMe");

                if (rememberMe && rememberMe.checked) {

                    localStorage.setItem(
                        "burggyRememberMe",
                        "true"
                    );

                } else {

                    localStorage.removeItem(
                        "burggyRememberMe"
                    );
                }


                /* -----------------------------------------
                   SUCCESS MESSAGE
                ------------------------------------------ */

                showMessage(
                    "Login successful. Welcome back! 🍔",
                    "success"
                );


                /* -----------------------------------------
                   REDIRECT
                ------------------------------------------ */

                setTimeout(() => {

                    window.location.href =
                        "checkout.html";

                }, 650);


                return;
            }


            /* =============================================
               API ERROR
            ============================================== */

            let errorMessage =
                "Unable to login. Please try again.";


            if (data.message) {

                errorMessage = data.message;

            } else if (data.error) {

                errorMessage = data.error;

            }


            /* Make backend messages cleaner */

            if (
                errorMessage.toLowerCase()
                    .includes("user not found")
            ) {

                errorMessage =
                    "No account found with this email.";

            } else if (
                errorMessage.toLowerCase()
                    .includes("invalid password")
            ) {

                errorMessage =
                    "Incorrect password. Please try again.";

            }


            showMessage(errorMessage);

            setLoading(false);

        } catch (error) {

            console.error(
                "Burggy login error:",
                error
            );


            showMessage(
                "Cannot connect to Burggy server. Make sure your backend is running."
            );

            setLoading(false);

        }

    });


    /* =====================================================
       AUTO-CLEAR MESSAGE WHEN USER STARTS TYPING
    ====================================================== */

    [emailInput, passwordInput].forEach((input) => {

        if (!input) return;

        input.addEventListener("focus", () => {

            if (
                loginMessage &&
                loginMessage.classList.contains("error")
            ) {
                clearMessage();
            }

        });

    });


    /* =====================================================
       PREVENT DOUBLE SUBMISSION
    ====================================================== */

    window.addEventListener("beforeunload", () => {

        if (loginButton) {

            loginButton.disabled = false;

        }

    });


    /* =====================================================
       DEBUG
    ====================================================== */

    console.log(
        "🍔 Burggy login initialized successfully."
    );

});