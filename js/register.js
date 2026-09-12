/* =========================================================
   BURGGY
   REGISTER.JS — PREMIUM AUTHENTICATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIG
    ===================================================== */

    const API_URL = "http://localhost:5000/api/users/register";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const registerForm = document.getElementById("registerForm");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const registerMessage =
        document.getElementById("registerMessage");

    const registerButton =
        document.getElementById("registerButton");


    /* =====================================================
       SAFETY CHECK
    ===================================================== */

    if (!registerForm) {
        console.warn("Burggy: register form not found.");
        return;
    }


    /* =====================================================
       HELPERS
    ===================================================== */

    function showMessage(message, type = "error") {

        if (!registerMessage) return;

        registerMessage.textContent = message;
        registerMessage.className = `form-message ${type}`;

        registerMessage.style.display = "block";
    }


    function clearMessage() {

        if (!registerMessage) return;

        registerMessage.textContent = "";
        registerMessage.className = "form-message";
        registerMessage.style.display = "none";
    }


    function setLoading(isLoading) {

        if (!registerButton) return;

        registerButton.disabled = isLoading;

        if (isLoading) {

            registerButton.dataset.originalText =
                registerButton.innerHTML;

            registerButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Creating Account...
            `;

        } else {

            registerButton.innerHTML =
                registerButton.dataset.originalText ||
                `
                Create Account
                <i class="fa-solid fa-arrow-right"></i>
                `;
        }
    }


    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }


    function isValidPhone(phone) {

        return /^[0-9]{10}$/.test(phone);
    }


    function isStrongEnoughPassword(password) {

        return password.length >= 6;
    }


    function getErrorMessage(data) {

        if (!data) {
            return "Something went wrong. Please try again.";
        }

        if (data.message) {
            return data.message;
        }

        if (data.error) {
            return data.error;
        }

        return "Unable to create your account. Please try again.";
    }


    /* =====================================================
       INPUT CLEANUP
    ===================================================== */

    if (phoneInput) {

        phoneInput.addEventListener("input", () => {

            phoneInput.value =
                phoneInput.value.replace(/\D/g, "").slice(0, 10);

        });
    }


    /* =====================================================
       CLEAR MESSAGE WHILE TYPING
    ===================================================== */

    [
        nameInput,
        emailInput,
        phoneInput,
        passwordInput,
        confirmPasswordInput
    ].forEach(input => {

        if (!input) return;

        input.addEventListener("input", () => {

            if (
                registerMessage &&
                registerMessage.style.display === "block"
            ) {
                clearMessage();
            }

        });
    });


    /* =====================================================
       FORM SUBMISSION
    ===================================================== */

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearMessage();


        /* =================================================
           GET VALUES
        ================================================= */

        const name =
            nameInput?.value.trim() || "";

        const email =
            emailInput?.value.trim().toLowerCase() || "";

        const phone =
            phoneInput?.value.trim() || "";

        const password =
            passwordInput?.value || "";

        const confirmPassword =
            confirmPasswordInput?.value || "";


        /* =================================================
           VALIDATION
        ================================================= */

        if (!name) {

            showMessage("Please enter your full name.");
            nameInput?.focus();
            return;
        }


        if (name.length < 2) {

            showMessage("Please enter a valid name.");
            nameInput?.focus();
            return;
        }


        if (!email) {

            showMessage("Please enter your email address.");
            emailInput?.focus();
            return;
        }


        if (!isValidEmail(email)) {

            showMessage("Please enter a valid email address.");
            emailInput?.focus();
            return;
        }


        if (!phone) {

            showMessage("Please enter your phone number.");
            phoneInput?.focus();
            return;
        }


        if (!isValidPhone(phone)) {

            showMessage(
                "Please enter a valid 10-digit phone number."
            );

            phoneInput?.focus();
            return;
        }


        if (!password) {

            showMessage("Please create a password.");
            passwordInput?.focus();
            return;
        }


        if (!isStrongEnoughPassword(password)) {

            showMessage(
                "Password must be at least 6 characters long."
            );

            passwordInput?.focus();
            return;
        }


        if (!confirmPassword) {

            showMessage("Please confirm your password.");
            confirmPasswordInput?.focus();
            return;
        }


        if (password !== confirmPassword) {

            showMessage("Passwords do not match.");
            confirmPasswordInput?.focus();
            return;
        }


        /* =================================================
           LOADING STATE
        ================================================= */

        setLoading(true);


        /* =================================================
           REGISTER USER
        ================================================= */

        try {

            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    password
                })

            });


            let data = null;

            try {
                data = await response.json();
            } catch (jsonError) {
                data = null;
            }


            /* =============================================
               BACKEND ERROR
            ============================================= */

            if (!response.ok) {

                let message = getErrorMessage(data);

                /* Make common Mongo/backend errors friendlier */

                if (
                    message.toLowerCase().includes("duplicate") ||
                    message.toLowerCase().includes("already exists")
                ) {

                    message =
                        "An account with this email already exists. Please login instead.";
                }

                showMessage(message);

                setLoading(false);

                return;
            }


            /* =============================================
               SUCCESS
            ============================================= */

            showMessage(
                "Account created successfully! Redirecting to login...",
                "success"
            );


            registerButton.disabled = true;


            /* Small delay so the success message is visible */

            setTimeout(() => {

                window.location.href = "login.html";

            }, 1200);


        } catch (error) {

            console.error(
                "Burggy registration error:",
                error
            );


            showMessage(
                "Unable to connect to the Burggy server. Please make sure the backend is running."
            );


            setLoading(false);
        }

    });


    /* =====================================================
       PASSWORD MATCH FEEDBACK
    ===================================================== */

    if (confirmPasswordInput) {

        confirmPasswordInput.addEventListener("input", () => {

            const password =
                passwordInput?.value || "";

            const confirmPassword =
                confirmPasswordInput.value || "";


            if (!confirmPassword) {
                confirmPasswordInput.classList.remove(
                    "password-match",
                    "password-mismatch"
                );
                return;
            }


            if (password === confirmPassword) {

                confirmPasswordInput.classList.add(
                    "password-match"
                );

                confirmPasswordInput.classList.remove(
                    "password-mismatch"
                );

            } else {

                confirmPasswordInput.classList.add(
                    "password-mismatch"
                );

                confirmPasswordInput.classList.remove(
                    "password-match"
                );
            }

        });
    }


    /* =====================================================
       PASSWORD STRENGTH FEEDBACK
    ===================================================== */

    if (passwordInput) {

        passwordInput.addEventListener("input", () => {

            const password = passwordInput.value;

            if (!password) {

                passwordInput.classList.remove(
                    "password-weak",
                    "password-medium",
                    "password-strong"
                );

                return;
            }


            passwordInput.classList.remove(
                "password-weak",
                "password-medium",
                "password-strong"
            );


            if (password.length < 6) {

                passwordInput.classList.add(
                    "password-weak"
                );

            } else if (
                password.length >= 6 &&
                password.length < 10
            ) {

                passwordInput.classList.add(
                    "password-medium"
                );

            } else {

                passwordInput.classList.add(
                    "password-strong"
                );
            }

        });
    }


    /* =====================================================
       PREVENT ACCIDENTAL DOUBLE SUBMISSION
    ===================================================== */

    let submitting = false;

    registerForm.addEventListener("submit", (event) => {

        if (submitting) {
            event.preventDefault();
            return;
        }

        submitting = true;

        setTimeout(() => {
            submitting = false;
        }, 3000);

    });


    /* =====================================================
       CONSOLE STATUS
    ===================================================== */

    console.log(
        "🍔 Burggy registration system initialized."
    );

});