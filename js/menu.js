/* =========================================================
   BURGGY — DYNAMIC MENU
   Menu + Wishlist + Cart + Category Filters
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const menuContainer =
        document.getElementById("menuContainer");

    if (!menuContainer) {
        console.error("❌ menuContainer not found");
        return;
    }


    /* =====================================================
       CONFIG
    ===================================================== */

    const API_URL =
        "http://localhost:5000/api/foods";


    let wishlist =
        JSON.parse(
            localStorage.getItem("wishlist")
        ) || [];


    /*
       Keep a reference to an existing cart function
       if cart.js has already created one.
    */

    const existingAddToCart =
        typeof window.addToCart === "function"
            ? window.addToCart
            : null;


    /* =====================================================
       HELPERS
    ===================================================== */

    function escapeHTML(value) {

        if (
            value === undefined ||
            value === null
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function getImageURL(image) {

        if (!image) {
            return "images/food-placeholder.jpg";
        }

        return image;
    }


    function getCategory(food) {

        if (food.category) {
            return food.category;
        }


        const name =
            (food.name || "").toLowerCase();


        /* Shawarma / Rolls */

        if (
            name.includes("roll") ||
            name.includes("kuboos") ||
            name.includes("rumali") ||
            name.includes("crispy") ||
            name.includes("arabian")
        ) {
            return "Shawarma & Crispy Roll";
        }


        /* Loaded Fries */

        if (
            name.includes("loaded fries") ||
            name.includes("cheese fries")
        ) {
            return "Loaded Fries & Cheese Fries";
        }


        /* Burgers */

        if (
            name.includes("burger") ||
            name.includes("sandwich")
        ) {
            return "Burger & Sandwich";
        }


        /* Combos */

        if (
            name.includes("meal") ||
            name.includes("combo") ||
            name.includes("party") ||
            name.includes("family") ||
            name.includes("jumbo")
        ) {
            return "Chicken Fried Combos";
        }


        /* Snacks */

        if (
            name.includes("snack") ||
            name.includes("nugget") ||
            name.includes("wing")
        ) {
            return "Snacks";
        }


        /* Drinks */

        if (
            name.includes("tea") ||
            name.includes("coffee") ||
            name.includes("juice") ||
            name.includes("mojito") ||
            name.includes("shake") ||
            name.includes("drink")
        ) {
            return "Drinks";
        }


        return "Other";
    }


    function getCategoryIcon(category) {

        const value =
            category.toLowerCase();


        if (
            value.includes("shawarma") ||
            value.includes("crispy")
        ) {
            return "fa-solid fa-utensils";
        }


        if (value.includes("fries")) {
            return "fa-solid fa-fire";
        }


        if (value.includes("burger")) {
            return "fa-solid fa-burger";
        }


        if (value.includes("combo")) {
            return "fa-solid fa-drumstick-bite";
        }


        if (value.includes("snack")) {
            return "fa-solid fa-cookie-bite";
        }


        if (value.includes("drink")) {
            return "fa-solid fa-glass-water";
        }


        return "fa-solid fa-utensils";
    }


    /* =====================================================
       LOADING
    ===================================================== */

    function showLoading() {

        menuContainer.innerHTML = `

            <div class="menu-loading">

                <div class="menu-loading-spinner">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                </div>

                <h3>
                    Loading Burggy's menu...
                </h3>

                <p>
                    Preparing something delicious.
                </p>

            </div>

        `;
    }


    /* =====================================================
       EMPTY
    ===================================================== */

    function showEmpty() {

        menuContainer.innerHTML = `

            <div class="menu-empty">

                <i class="fa-solid fa-utensils"></i>

                <h2>
                    Menu Coming Soon
                </h2>

                <p>
                    We're preparing Burggy's delicious menu.
                </p>

            </div>

        `;
    }


    /* =====================================================
       ERROR
    ===================================================== */

    function showError() {

        menuContainer.innerHTML = `

            <div class="menu-error">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h2>
                    Unable to load menu
                </h2>

                <p>
                    Please make sure the Burggy server
                    is running.
                </p>

                <button
                    class="menu-retry-btn"
                    id="menuRetryBtn"
                    type="button"
                >

                    <i class="fa-solid fa-rotate-right"></i>

                    Try Again

                </button>

            </div>

        `;


        const retry =
            document.getElementById(
                "menuRetryBtn"
            );


        if (retry) {

            retry.addEventListener(
                "click",
                loadMenu
            );

        }
    }


    /* =====================================================
       WISHLIST COUNT
    ===================================================== */

    function updateWishlistCount() {

        const counters =
            document.querySelectorAll(
                ".wishlist-count"
            );


        counters.forEach(counter => {

            counter.textContent =
                wishlist.length;


            counter.style.display =
                wishlist.length > 0
                    ? "flex"
                    : "none";

        });
    }


    /* =====================================================
       CART COUNT
    ===================================================== */

    function updateCartCount() {

        const counters =
            document.querySelectorAll(
                ".cart-count"
            );


        let cart =
            JSON.parse(
                localStorage.getItem("cart")
            ) || [];


        let total = 0;


        cart.forEach(item => {

            total +=
                Number(
                    item.quantity || 1
                );

        });


        counters.forEach(counter => {

            counter.textContent = total;

            counter.style.display =
                total > 0
                    ? "flex"
                    : "none";

        });
    }


    /* =====================================================
       WISHLIST
    ===================================================== */

    function toggleWishlist(
        foodId,
        button
    ) {

        const exists =
            wishlist.includes(foodId);


        if (exists) {

            wishlist =
                wishlist.filter(
                    id => id !== foodId
                );


            button.classList.remove(
                "active"
            );


            button.innerHTML =
                `<i class="fa-regular fa-heart"></i>`;


            showToast(
                "Removed from wishlist",
                "heart"
            );

        } else {

            wishlist.push(foodId);


            button.classList.add(
                "active"
            );


            button.innerHTML =
                `<i class="fa-solid fa-heart"></i>`;


            showToast(
                "Added to wishlist",
                "heart"
            );
        }


        localStorage.setItem(
            "wishlist",
            JSON.stringify(wishlist)
        );


        updateWishlistCount();
    }


    /* =====================================================
       ADD TO CART
    ===================================================== */

    function addFoodToCart(foodId) {

        /*
           Use your existing cart.js
           when available.
        */

        if (existingAddToCart) {

            existingAddToCart(foodId);

            setTimeout(
                updateCartCount,
                100
            );

            return;
        }


        /*
           Fallback cart system.
        */

        let cart =
            JSON.parse(
                localStorage.getItem("cart")
            ) || [];


        const existing =
            cart.find(
                item =>
                    item.foodId === foodId
            );


        if (existing) {

            existing.quantity =
                Number(
                    existing.quantity || 1
                ) + 1;

        } else {

            cart.push({

                foodId: foodId,

                quantity: 1

            });

        }


        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        updateCartCount();


        showToast(
            "Added to cart",
            "cart"
        );
    }


    /*
       Global compatibility.
    */

    window.burggyAddToCart =
        addFoodToCart;


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(
        message,
        type = "cart"
    ) {

        let toast =
            document.getElementById(
                "burggyToast"
            );


        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );

            toast.id =
                "burggyToast";

            toast.className =
                "burggy-toast";

            document.body.appendChild(
                toast
            );
        }


        const icon =
            type === "heart"
                ? "fa-heart"
                : "fa-cart-shopping";


        toast.innerHTML = `

            <i class="fa-solid ${icon}"></i>

            <span>
                ${escapeHTML(message)}
            </span>

        `;


        toast.classList.add(
            "show"
        );


        clearTimeout(
            toast.hideTimer
        );


        toast.hideTimer =
            setTimeout(() => {

                toast.classList.remove(
                    "show"
                );

            }, 2200);
    }


    /* =====================================================
       CREATE FOOD CARD
    ===================================================== */

    function createFoodCard(food) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "menu-card";


        card.dataset.id =
            food._id;


        card.dataset.category =
            getCategory(food);


        const isFavorite =
            wishlist.includes(
                food._id
            );


        const category =
            getCategory(food);


        const image =
            getImageURL(
                food.image
            );


        const rating =
            food.rating || 4.8;


        const description =
            food.description ||
            "Freshly prepared with Burggy's signature taste.";


        const badge =
            food.badge ||
            (
                food.isBestSeller ||
                food.bestSeller ||
                food.isPopular ||
                food.popular
                    ? "Popular"
                    : ""
            );


        card.innerHTML = `

            <div class="menu-card-image">

                ${
                    badge
                        ? `
                            <span class="menu-badge">
                                ${escapeHTML(badge)}
                            </span>
                          `
                        : ""
                }


                <button
                    class="menu-wishlist-btn ${
                        isFavorite
                            ? "active"
                            : ""
                    }"
                    data-id="${escapeHTML(food._id)}"
                    type="button"
                    aria-label="Wishlist"
                >

                    <i class="${
                        isFavorite
                            ? "fa-solid"
                            : "fa-regular"
                    } fa-heart"></i>

                </button>


                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(food.name)}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='images/food-placeholder.jpg';
                    "
                >

            </div>


            <div class="menu-card-content">


                <div class="menu-card-top">

                    <span class="menu-card-category">
                        ${escapeHTML(category)}
                    </span>


                    <div class="menu-rating">

                        <i class="fa-solid fa-star"></i>

                        <span>
                            ${escapeHTML(rating)}
                        </span>

                    </div>

                </div>


                <h3 class="menu-card-title">
                    ${escapeHTML(food.name)}
                </h3>


                <p class="menu-description">
                    ${escapeHTML(description)}
                </p>


                <div class="menu-card-bottom">


                    <div class="menu-price">

                        <span>₹</span>${escapeHTML(
                            food.price
                        )}

                    </div>


                    <button
                        class="menu-add-btn"
                        data-id="${escapeHTML(food._id)}"
                        type="button"
                    >

                        <span>
                            Add to Cart
                        </span>

                        <i class="fa-solid fa-plus"></i>

                    </button>

                </div>

            </div>

        `;


        /* =================================================
           WISHLIST BUTTON
        ================================================== */

        const wishlistButton =
            card.querySelector(
                ".menu-wishlist-btn"
            );


        wishlistButton.addEventListener(
            "click",
            () => {

                toggleWishlist(
                    food._id,
                    wishlistButton
                );

            }
        );


        /* =================================================
           CART BUTTON
        ================================================== */

        const cartButton =
            card.querySelector(
                ".menu-add-btn"
            );


        cartButton.addEventListener(
            "click",
            () => {

                addFoodToCart(
                    food._id
                );


                cartButton.classList.add(
                    "added"
                );


                setTimeout(() => {

                    cartButton.classList.remove(
                        "added"
                    );

                }, 700);

            }
        );


        return card;
    }


    /* =====================================================
       CATEGORY ORDER
    ===================================================== */

    const categoryOrder = [

        "Shawarma & Crispy Roll",

        "Loaded Fries & Cheese Fries",

        "Chicken Fried Combos",

        "Burger & Sandwich",

        "Snacks",

        "Drinks",

        "Other"

    ];


    /* =====================================================
       RENDER CATEGORY
    ===================================================== */

    function renderCategory(
        categoryName,
        foods
    ) {

        const section =
            document.createElement(
                "section"
            );


        section.className =
            "menu-category";


        section.dataset.category =
            categoryName;


        section.innerHTML = `

            <div class="menu-category-heading">

                <div class="menu-category-title">

                    <div class="menu-category-icon">

                        <i class="${getCategoryIcon(
                            categoryName
                        )}"></i>

                    </div>


                    <div>

                        <span class="menu-category-eyebrow">
                            BURGGY MENU
                        </span>


                        <h2>
                            ${escapeHTML(
                                categoryName
                            )}
                        </h2>

                    </div>

                </div>


                <span class="menu-category-count">

                    ${foods.length}

                    ${
                        foods.length === 1
                            ? "item"
                            : "items"
                    }

                </span>

            </div>


            <div class="menu-grid"></div>

        `;


        const grid =
            section.querySelector(
                ".menu-grid"
            );


        foods.forEach(food => {

            grid.appendChild(
                createFoodCard(food)
            );

        });


        menuContainer.appendChild(
            section
        );
    }


    /* =====================================================
       FILTER MENU
    ===================================================== */

    function filterMenu(category) {

        const sections =
            document.querySelectorAll(
                ".menu-category"
            );


        sections.forEach(section => {

            const sectionCategory =
                section.dataset.category;


            if (
                category === "all" ||
                sectionCategory === category
            ) {

                section.style.display =
                    "block";

            } else {

                section.style.display =
                    "none";

            }

        });


        /*
           Scroll to menu content after
           selecting a category.
        */

        if (category !== "all") {

            const selected =
                document.querySelector(
                    `.menu-category[data-category="${CSS.escape(category)}"]`
                );


            if (selected) {

                setTimeout(() => {

                    selected.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }, 50);

            }

        } else {

            const menuSection =
                document.querySelector(
                    ".menu-section"
                );


            if (menuSection) {

                menuSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    }


    /* =====================================================
       CATEGORY BUTTONS
    ===================================================== */

    function setupFilters() {

        const filterButtons =
            document.querySelectorAll(
                ".menu-filter"
            );


        filterButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    filterButtons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    const category =
                        button.dataset.filter ||
                        "all";


                    filterMenu(
                        category
                    );

                }
            );

        });
    }


    /* =====================================================
       LOAD MENU
    ===================================================== */

    async function loadMenu() {

        showLoading();


        try {

            const response =
                await fetch(
                    API_URL
                );


            if (!response.ok) {

                throw new Error(
                    `Server returned ${response.status}`
                );

            }


            const foods =
                await response.json();


            if (
                !Array.isArray(foods) ||
                foods.length === 0
            ) {

                showEmpty();

                return;
            }


            menuContainer.innerHTML =
                "";


            /*
               Group foods by category.
            */

            const groupedFoods = {};


            foods.forEach(food => {

                const category =
                    getCategory(food);


                if (
                    !groupedFoods[category]
                ) {

                    groupedFoods[category] =
                        [];

                }


                groupedFoods[category].push(
                    food
                );

            });


            /*
               Render categories in
               Burggy's menu order.
            */

            categoryOrder.forEach(
                category => {

                    if (
                        groupedFoods[category] &&
                        groupedFoods[category].length
                    ) {

                        renderCategory(
                            category,
                            groupedFoods[category]
                        );

                    }

                }
            );


            /*
               Render any additional
               categories added later.
            */

            Object.keys(
                groupedFoods
            ).forEach(category => {

                if (
                    !categoryOrder.includes(
                        category
                    )
                ) {

                    renderCategory(
                        category,
                        groupedFoods[category]
                    );

                }

            });


            updateWishlistCount();

            updateCartCount();

        } catch (error) {

            console.error(
                "❌ Burggy menu error:",
                error
            );


            showError();

        }
    }


    /* =====================================================
       CART CHANGES FROM OTHER PAGES
    ===================================================== */

    window.addEventListener(
        "storage",
        event => {

            if (
                event.key === "cart"
            ) {

                updateCartCount();

            }


            if (
                event.key === "wishlist"
            ) {

                wishlist =
                    JSON.parse(
                        event.newValue
                    ) || [];


                updateWishlistCount();

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    setupFilters();

    updateWishlistCount();

    updateCartCount();

    loadMenu();

});