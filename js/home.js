// ============================================================
// BURGGY
// home.js
// Homepage Food / Best Sellers
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    const foodContainer = document.getElementById("homeBestSellers");

    if (!foodContainer) {
        return;
    }


    // ========================================================
    // API CONFIGURATION
    // ========================================================

    const API_URL = "http://localhost:5000/api/foods";


    // ========================================================
    // ESCAPE HTML
    // Prevents broken HTML when food data contains
    // special characters.
// ========================================================

    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // ========================================================
    // IMAGE URL
    // ========================================================

    function getImageUrl(image) {

        if (!image) {
            return "images/food-placeholder.jpg";
        }

        // Already a complete URL
        if (
            image.startsWith("http://") ||
            image.startsWith("https://") ||
            image.startsWith("data:")
        ) {
            return image;
        }

        // Backend upload path
        if (image.startsWith("/uploads/")) {
            return `http://localhost:5000${image}`;
        }

        if (image.startsWith("uploads/")) {
            return `http://localhost:5000/${image}`;
        }

        // Frontend image
        if (image.startsWith("/")) {
            return image;
        }

        return image;
    }


    // ========================================================
    // RATING
    // ========================================================

    function getRating(food) {

        const rating =
            Number(food.rating) ||
            Number(food.averageRating) ||
            4.8;

        return Math.min(5, Math.max(0, rating)).toFixed(1);
    }


    // ========================================================
    // BADGE
    // ========================================================

    function getBadge(food, index) {

        if (
            food.isBestSeller === true ||
            food.bestSeller === true
        ) {
            return "BESTSELLER";
        }

        if (
            food.isPopular === true ||
            food.popular === true
        ) {
            return "POPULAR";
        }

        if (food.badge) {
            return String(food.badge).toUpperCase();
        }

        // Give the first item a subtle badge only if
        // the backend doesn't provide one.
        if (index === 0) {
            return "BURGGY FAVOURITE";
        }

        return "";
    }


    // ========================================================
    // FOOD CARD
    // ========================================================

    function createFoodCard(food, index) {

        const id = escapeHTML(food._id);

        const name =
            escapeHTML(food.name || "Delicious Burggy");

        const description =
            escapeHTML(
                food.description ||
                "Freshly prepared and packed with flavour."
            );

        const price =
            Number(food.price) || 0;

        const image =
            escapeHTML(getImageUrl(food.image));

        const rating =
            getRating(food);

        const badge =
            getBadge(food, index);


        return `
            <article
                class="food-card"
                data-food-id="${id}"
            >

                <div class="food-image">

                    <img
                        src="${image}"
                        alt="${name}"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='images/food-placeholder.jpg';"
                    >

                    ${
                        badge
                            ? `
                                <span class="food-badge">
                                    ${escapeHTML(badge)}
                                </span>
                              `
                            : ""
                    }

                    <button
                        type="button"
                        class="wishlist-btn"
                        aria-label="Add ${name} to wishlist"
                        onclick="handleHomeWishlist('${id}', this)"
                    >
                        <i class="fa-regular fa-heart"></i>
                    </button>

                </div>


                <div class="food-content">

                    <div class="food-top">

                        <h3>
                            ${name}
                        </h3>

                        <div class="food-rating">

                            <i class="fa-solid fa-star"></i>

                            <span>
                                ${rating}
                            </span>

                        </div>

                    </div>


                    <p class="food-description">
                        ${description}
                    </p>


                    <div class="food-bottom">

                        <span class="food-price">
                            ₹${price.toFixed(0)}
                        </span>

                        <button
                            type="button"
                            class="food-order-btn"
                            onclick="handleHomeAddToCart('${id}')"
                        >
                            <i class="fa-solid fa-plus"></i>
                            Add
                        </button>

                    </div>

                </div>

            </article>
        `;
    }


    // ========================================================
    // LOADING
    // ========================================================

    function showLoading() {

        foodContainer.innerHTML = `
            <div class="home-loading">

                <i class="fa-solid fa-spinner fa-spin"></i>

                <span>
                    Loading delicious food...
                </span>

            </div>
        `;
    }


    // ========================================================
    // EMPTY STATE
    // ========================================================

    function showEmpty() {

        foodContainer.innerHTML = `
            <div class="home-empty">

                <i class="fa-solid fa-utensils"></i>

                <h3>
                    No dishes available
                </h3>

                <p>
                    Our kitchen is preparing something delicious.
                </p>

                <a
                    href="menu.html"
                    class="btn"
                >
                    Explore Menu
                    <i class="fa-solid fa-arrow-right"></i>
                </a>

            </div>
        `;
    }


    // ========================================================
    // ERROR STATE
    // ========================================================

    function showError() {

        foodContainer.innerHTML = `
            <div class="home-error">

                <i class="fa-solid fa-circle-exclamation"></i>

                <h3>
                    Couldn't load the menu
                </h3>

                <p>
                    Please check that the Burggy server is running.
                </p>

                <button
                    type="button"
                    class="btn"
                    id="retryHomeFoods"
                >
                    Try Again
                    <i class="fa-solid fa-rotate-right"></i>
                </button>

            </div>
        `;


        const retryButton =
            document.getElementById("retryHomeFoods");

        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadBestSellers
            );

        }

    }


    // ========================================================
    // LOAD BEST SELLERS
    // ========================================================

    async function loadBestSellers() {

        showLoading();


        try {

            const response =
                await fetch(API_URL, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                });


            if (!response.ok) {

                throw new Error(
                    `Server returned ${response.status}`
                );

            }


            const data =
                await response.json();


            // Support common API response formats:
            // [ foods ]
            // { foods: [ ... ] }
            // { data: [ ... ] }

            let foods = [];

            if (Array.isArray(data)) {

                foods = data;

            } else if (Array.isArray(data.foods)) {

                foods = data.foods;

            } else if (Array.isArray(data.data)) {

                foods = data.data;

            }


            if (!foods.length) {

                showEmpty();
                return;

            }


            // Show a maximum of 4 homepage products.
            const bestSellers =
                foods.slice(0, 4);


            foodContainer.innerHTML =
                bestSellers
                    .map((food, index) =>
                        createFoodCard(food, index)
                    )
                    .join("");


            // Trigger reveal observer for newly created cards
            foodContainer
                .querySelectorAll(".food-card")
                .forEach(card => {

                    card.classList.add("show");

                });


            console.log(
                `🍔 Burggy: ${bestSellers.length} homepage dishes loaded.`
            );


        } catch (error) {

            console.error(
                "Burggy food loading error:",
                error
            );

            showError();

        }

    }


    // ========================================================
    // ADD TO CART
    // ========================================================

    window.handleHomeAddToCart = function (foodId) {

        if (!foodId) return;


        // Use the existing global cart function if available.
        if (typeof window.addToCart === "function") {

            window.addToCart(foodId);

            return;

        }


        console.warn(
            "addToCart() is not available yet."
        );

        // Keep the user informed instead of silently failing.
        showToast(
            "Cart is loading. Please try again."
        );

    };


    // ========================================================
    // WISHLIST
    // ========================================================

    window.handleHomeWishlist = function (
        foodId,
        button
    ) {

        if (!foodId || !button) return;


        // If the existing wishlist function is available,
        // use it without replacing its implementation.

        if (typeof window.addToWishlist === "function") {

            window.addToWishlist(foodId);

            button.classList.toggle("active");

            const icon =
                button.querySelector("i");

            if (icon) {

                icon.classList.toggle(
                    "fa-regular"
                );

                icon.classList.toggle(
                    "fa-solid"
                );

            }

            return;
        }


        // Visual fallback until wishlist.js is loaded.
        button.classList.toggle("active");

        const icon =
            button.querySelector("i");

        if (icon) {

            icon.classList.toggle(
                "fa-regular"
            );

            icon.classList.toggle(
                "fa-solid"
            );

        }

    };


    // ========================================================
    // TOAST MESSAGE
    // ========================================================

    function showToast(message) {

        let toast =
            document.getElementById("burggyToast");


        if (!toast) {

            toast =
                document.createElement("div");

            toast.id =
                "burggyToast";

            document.body.appendChild(toast);

        }


        toast.textContent =
            message;

        toast.classList.add("show");


        clearTimeout(
            window.burggyToastTimer
        );


        window.burggyToastTimer =
            setTimeout(() => {

                toast.classList.remove(
                    "show"
                );

            }, 2500);

    }


    // ========================================================
    // START
    // ========================================================

    loadBestSellers();

});