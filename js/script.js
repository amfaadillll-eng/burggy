// ============================================================
// BURGGY
// script.js
// Premium Global Website Interactions
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // ========================================================
    // ELEMENTS
    // ========================================================

    const navbar = document.querySelector(".navbar");

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileNav = document.getElementById("mobileNav");


    // ========================================================
    // STICKY NAVBAR
    // ========================================================

    function updateNavbar() {

        if (!navbar) return;

        if (window.scrollY > 60) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    }

    window.addEventListener("scroll", updateNavbar, {
        passive: true
    });

    updateNavbar();


    // ========================================================
    // MOBILE NAVIGATION
    // ========================================================

    function closeMobileMenu() {

        if (!mobileNav || !mobileMenuBtn) return;

        mobileNav.classList.remove("active");
        mobileMenuBtn.classList.remove("active");

        mobileMenuBtn.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.classList.remove("menu-open");

    }


    function toggleMobileMenu() {

        if (!mobileNav || !mobileMenuBtn) return;

        const isOpen =
            mobileNav.classList.contains("active");

        if (isOpen) {

            closeMobileMenu();

        } else {

            mobileNav.classList.add("active");
            mobileMenuBtn.classList.add("active");

            mobileMenuBtn.setAttribute(
                "aria-expanded",
                "true"
            );

            document.body.classList.add("menu-open");

        }

    }


    if (mobileMenuBtn && mobileNav) {

        mobileMenuBtn.setAttribute(
            "aria-expanded",
            "false"
        );

        mobileMenuBtn.setAttribute(
            "aria-controls",
            "mobileNav"
        );

        mobileMenuBtn.setAttribute(
            "aria-label",
            "Open navigation menu"
        );


        mobileMenuBtn.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                toggleMobileMenu();

            }
        );


        // Close menu after clicking a mobile link

        mobileNav
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        closeMobileMenu();

                    }
                );

            });


        // Prevent clicks inside mobile menu
        // from triggering outside-click close

        mobileNav.addEventListener(
            "click",
            event => {

                event.stopPropagation();

            }
        );

    }


    // ========================================================
    // CLOSE MOBILE MENU WHEN CLICKING OUTSIDE
    // ========================================================

    document.addEventListener(
        "click",
        event => {

            if (!mobileNav || !mobileMenuBtn) {
                return;
            }

            if (
                mobileNav.classList.contains("active") &&
                !mobileNav.contains(event.target) &&
                !mobileMenuBtn.contains(event.target)
            ) {

                closeMobileMenu();

            }

        }
    );


    // ========================================================
    // CLOSE MOBILE MENU ON ESCAPE
    // ========================================================

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeMobileMenu();

            }

        }
    );


    // ========================================================
    // CLOSE MOBILE MENU WHEN SCREEN BECOMES DESKTOP
    // ========================================================

    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth > 900) {

                closeMobileMenu();

            }

        }
    );


    // ========================================================
    // SMOOTH SCROLL
    // ========================================================

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(anchor => {

            anchor.addEventListener(
                "click",
                function (e) {

                    const targetId =
                        this.getAttribute("href");

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(targetId);

                    if (!target) return;

                    e.preventDefault();

                    const navbarHeight =
                        navbar
                            ? navbar.offsetHeight
                            : 0;

                    const targetPosition =
                        target.getBoundingClientRect().top +
                        window.scrollY -
                        navbarHeight;

                    window.scrollTo({

                        top: targetPosition,

                        behavior: "smooth"

                    });

                }
            );

        });


    // ========================================================
    // REVEAL ANIMATION
    // ========================================================

    const revealElements =
        document.querySelectorAll(
            "section, .category-card, .food-card, .why-card, " +
            ".review-card, .gallery-item, .story-content, " +
            ".story-image, .offer, .cta-box"
        );


    if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(

                (entries, observer) => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "show"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },

                {
                    threshold: 0.12,

                    rootMargin:
                        "0px 0px -40px 0px"
                }

            );


        revealElements.forEach(element => {

            element.classList.add("hidden");

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach(element => {

            element.classList.add("show");

        });

    }


    // ========================================================
    // FOOD CARD HOVER
    // ========================================================
    // Event delegation allows cards generated
    // dynamically by home.js to work correctly.

    document.addEventListener(
        "mouseover",
        event => {

            const card =
                event.target.closest(".food-card");

            if (!card) return;

            card.classList.add(
                "food-card-hover"
            );

        }
    );


    document.addEventListener(
        "mouseout",
        event => {

            const card =
                event.target.closest(".food-card");

            if (!card) return;

            if (
                card.contains(event.relatedTarget)
            ) {
                return;
            }

            card.classList.remove(
                "food-card-hover"
            );

        }
    );


    // ========================================================
    // BACK TO TOP BUTTON
    // ========================================================

    const topBtn =
        document.createElement("button");

    topBtn.type = "button";

    topBtn.id = "topBtn";

    topBtn.setAttribute(
        "aria-label",
        "Back to top"
    );

    topBtn.innerHTML = `
        <i class="fa-solid fa-arrow-up"></i>
    `;

    document.body.appendChild(topBtn);


    function updateTopButton() {

        if (window.scrollY > 500) {

            topBtn.classList.add(
                "visible"
            );

        } else {

            topBtn.classList.remove(
                "visible"
            );

        }

    }


    window.addEventListener(
        "scroll",
        updateTopButton,
        {
            passive: true
        }
    );


    updateTopButton();


    topBtn.addEventListener(
        "click",
        () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );


    // ========================================================
    // BUTTON PRESS ANIMATION
    // ========================================================

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(".btn");

            if (!button) return;

            button.classList.add(
                "btn-pressed"
            );


            setTimeout(
                () => {

                    button.classList.remove(
                        "btn-pressed"
                    );

                },
                150
            );

        }
    );


    // ========================================================
    // ACTIVE NAVIGATION
    // ========================================================

    const navLinks =
        document.querySelectorAll(
            ".nav-links a[href^='#']"
        );


    const pageSections =
        document.querySelectorAll(
            "section[id]"
        );


    function updateActiveNavigation() {

        if (
            !pageSections.length ||
            !navLinks.length
        ) {
            return;
        }


        let currentSection = "";


        pageSections.forEach(section => {

            const sectionTop =
                section.getBoundingClientRect().top +
                window.scrollY -
                180;


            if (
                window.scrollY >= sectionTop
            ) {

                currentSection =
                    section.id;

            }

        });


        navLinks.forEach(link => {

            link.classList.remove(
                "active"
            );


            const href =
                link.getAttribute("href");


            if (
                href ===
                `#${currentSection}`
            ) {

                link.classList.add(
                    "active"
                );

            }

        });

    }


    window.addEventListener(
        "scroll",
        updateActiveNavigation,
        {
            passive: true
        }
    );


    updateActiveNavigation();


    // ========================================================
    // PAGE LOAD
    // ========================================================

    window.addEventListener(
        "load",
        () => {

            document.body.classList.add(
                "page-loaded"
            );

        }
    );


    // ========================================================
    // CONSOLE
    // ========================================================

    console.log(
        "🍔 Burggy website loaded successfully."
    );

});
