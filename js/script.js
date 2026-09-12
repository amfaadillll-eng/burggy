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
    // SMOOTH SCROLL
    // ========================================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            const targetId = this.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            e.preventDefault();

            const navbarHeight = navbar
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

        });

    });


    // ========================================================
    // REVEAL ANIMATION
    // ========================================================

    const revealElements = document.querySelectorAll(
        "section, .category-card, .food-card, .why-card, " +
        ".review-card, .gallery-item, .story-content, " +
        ".story-image, .offer, .cta-box"
    );

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("show");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
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
    // Event delegation is used because home.js may create
    // food cards AFTER this script has already loaded.

    document.addEventListener("mouseover", event => {

        const card = event.target.closest(".food-card");

        if (!card) return;

        card.classList.add("food-card-hover");

    });


    document.addEventListener("mouseout", event => {

        const card = event.target.closest(".food-card");

        if (!card) return;

        // Prevent removing the class when moving
        // between elements inside the same card.

        if (card.contains(event.relatedTarget)) return;

        card.classList.remove("food-card-hover");

    });


    // ========================================================
    // BACK TO TOP BUTTON
    // ========================================================

    const topBtn = document.createElement("button");

    topBtn.type = "button";
    topBtn.id = "topBtn";
    topBtn.setAttribute("aria-label", "Back to top");
    topBtn.innerHTML = `
        <i class="fa-solid fa-arrow-up"></i>
    `;

    document.body.appendChild(topBtn);


    function updateTopButton() {

        if (window.scrollY > 500) {

            topBtn.classList.add("visible");

        } else {

            topBtn.classList.remove("visible");

        }

    }

    window.addEventListener("scroll", updateTopButton, {
        passive: true
    });

    updateTopButton();


    topBtn.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });


    // ========================================================
    // BUTTON PRESS ANIMATION
    // ========================================================

    document.addEventListener("click", event => {

        const button = event.target.closest(".btn");

        if (!button) return;

        button.classList.add("btn-pressed");

        setTimeout(() => {

            button.classList.remove("btn-pressed");

        }, 150);

    });


    // ========================================================
    // ACTIVE NAVIGATION
    // ========================================================

    const navLinks = document.querySelectorAll(
        ".nav-links a[href^='#']"
    );

    const pageSections = document.querySelectorAll(
        "section[id]"
    );


    function updateActiveNavigation() {

        if (!pageSections.length || !navLinks.length) {
            return;
        }

        let currentSection = "";

        pageSections.forEach(section => {

            const sectionTop =
                section.getBoundingClientRect().top +
                window.scrollY -
                180;

            if (window.scrollY >= sectionTop) {

                currentSection = section.id;

            }

        });


        navLinks.forEach(link => {

            link.classList.remove("active");

            const href = link.getAttribute("href");

            if (href === `#${currentSection}`) {

                link.classList.add("active");

            }

        });

    }

    window.addEventListener("scroll", updateActiveNavigation, {
        passive: true
    });

    updateActiveNavigation();


    // ========================================================
    // MOBILE NAVIGATION
    // ========================================================
    // Works if a mobile menu toggle exists in the HTML.
    // Otherwise it simply does nothing.

    const menuToggle = document.querySelector(
        ".menu-toggle, .mobile-menu-toggle, #menuToggle"
    );

    const navLinksContainer = document.querySelector(
        ".nav-links"
    );

    if (menuToggle && navLinksContainer) {

        menuToggle.addEventListener("click", () => {

            navLinksContainer.classList.toggle("mobile-open");

            menuToggle.classList.toggle("active");

        });


        navLinksContainer
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener("click", () => {

                    navLinksContainer.classList.remove(
                        "mobile-open"
                    );

                    menuToggle.classList.remove("active");

                });

            });

    }


    // ========================================================
    // CLOSE MOBILE MENU WHEN CLICKING OUTSIDE
    // ========================================================

    document.addEventListener("click", event => {

        if (!menuToggle || !navLinksContainer) return;

        if (
            !navLinksContainer.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {

            navLinksContainer.classList.remove(
                "mobile-open"
            );

            menuToggle.classList.remove("active");

        }

    });


    // ========================================================
    // PAGE LOAD
    // ========================================================

    window.addEventListener("load", () => {

        document.body.classList.add("page-loaded");

    });


    // ========================================================
    // CONSOLE
    // ========================================================

    console.log("🍔 Burggy website loaded successfully.");

});