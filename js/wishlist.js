/* =========================================================
   BURGGY
   WISHLIST MANAGEMENT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "http://localhost:5000/api/foods";

    const wishlistContainer =
        document.getElementById("wishlistContainer");

    const wishlistEmpty =
        document.getElementById("wishlistEmpty");

    const wishlistLoading =
        document.getElementById("wishlistLoading");

    const wishlistError =
        document.getElementById("wishlistError");

    const wishlistCount =
        document.getElementById("wishlistCount");

    const retryWishlist =
        document.getElementById("retryWishlist");


    let wishlist = JSON.parse(
        localStorage.getItem("wishlist") || "[]"
    );

    let foods = [];


    /* =====================================================
       HELPERS
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function formatPrice(value) {

        return `₹${Number(value || 0).toLocaleString("en-IN")}`;

    }


    function getImageURL(image) {

        if (!image) {
            return "images/burggylogo.png";
        }

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        if (image.startsWith("/uploads/")) {
            return `http://localhost:5000${image}`;
        }

        if (image.startsWith("uploads/")) {
            return `http://localhost:5000/${image}`;
        }

        return image;

    }


    function saveWishlist() {

        localStorage.setItem(
            "wishlist",
            JSON.stringify(wishlist)
        );

        updateWishlistCount();

    }


    function updateWishlistCount() {

        const count = wishlist.length;

        if (wishlistCount) {
            wishlistCount.textContent = count;
            wishlistCount.style.display =
                count > 0 ? "flex" : "none";
        }


        document
            .querySelectorAll("[data-wishlist-count]")
            .forEach(element => {

                element.textContent = count;

            });

    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {

        let toast =
            document.getElementById("burggyWishlistToast");


        if (!toast) {

            toast = document.createElement("div");

            toast.id = "burggyWishlistToast";

            toast.innerHTML = `
                <i class="fa-solid fa-circle-check"></i>
                <span></span>
            `;

            Object.assign(toast.style, {

                position: "fixed",
                right: "22px",
                bottom: "22px",
                zIndex: "99999",

                display: "flex",
                alignItems: "center",
                gap: "10px",

                padding: "13px 17px",

                border: "1px solid rgba(255,107,0,.25)",
                borderRadius: "10px",

                background: "#111111",
                color: "#ffffff",

                boxShadow:
                    "0 15px 40px rgba(0,0,0,.35)",

                fontSize: "13px",

                opacity: "0",
                transform: "translateY(10px)",

                transition:
                    "opacity .25s ease, transform .25s ease"

            });

            document.body.appendChild(toast);

        }


        const text =
            toast.querySelector("span");

        if (text) {
            text.textContent = message;
        }


        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";


        clearTimeout(
            window.burggyWishlistToastTimer
        );


        window.burggyWishlistToastTimer =
            setTimeout(() => {

                toast.style.opacity = "0";
                toast.style.transform =
                    "translateY(10px)";

            }, 2600);

    }


    /* =====================================================
       STATES
    ===================================================== */

    function showLoading() {

        if (wishlistLoading) {
            wishlistLoading.style.display = "flex";
        }

        if (wishlistContainer) {
            wishlistContainer.style.display = "none";
        }

        if (wishlistEmpty) {
            wishlistEmpty.style.display = "none";
        }

        if (wishlistError) {
            wishlistError.style.display = "none";
        }

    }


    function showEmpty() {

        if (wishlistLoading) {
            wishlistLoading.style.display = "none";
        }

        if (wishlistContainer) {
            wishlistContainer.style.display = "none";
        }

        if (wishlistError) {
            wishlistError.style.display = "none";
        }

        if (wishlistEmpty) {
            wishlistEmpty.style.display = "flex";
        }

    }


    function showError() {

        if (wishlistLoading) {
            wishlistLoading.style.display = "none";
        }

        if (wishlistContainer) {
            wishlistContainer.style.display = "none";
        }

        if (wishlistEmpty) {
            wishlistEmpty.style.display = "none";
        }

        if (wishlistError) {
            wishlistError.style.display = "flex";
        }

    }


    /* =====================================================
       LOAD MENU
    ===================================================== */

    async function loadWishlist() {

        updateWishlistCount();

        showLoading();


        if (wishlist.length === 0) {

            showEmpty();
            return;

        }


        try {

            const response =
                await fetch(API_URL);


            if (!response.ok) {
                throw new Error(
                    "Unable to load menu"
                );
            }


            const data =
                await response.json();


            foods =
                Array.isArray(data)
                    ? data
                    : [];


            /*
             * Keep only foods that still exist
             * in the database.
             */

            const availableIds =
                foods.map(food =>
                    String(food._id)
                );


            const oldLength =
                wishlist.length;


            wishlist =
                wishlist.filter(id =>
                    availableIds.includes(
                        String(id)
                    )
                );


            if (wishlist.length !== oldLength) {
                saveWishlist();
            }


            if (wishlist.length === 0) {

                showEmpty();
                return;

            }


            renderWishlist();

        } catch (error) {

            console.error(
                "Wishlist error:",
                error
            );

            showError();

        }

    }


    /* =====================================================
       RENDER WISHLIST
    ===================================================== */

    function renderWishlist() {

        if (!wishlistContainer) {
            return;
        }


        const wishlistFoods =
            foods.filter(food =>
                wishlist.includes(
                    String(food._id)
                )
            );


        if (wishlistFoods.length === 0) {

            showEmpty();
            return;

        }


        wishlistLoading.style.display = "none";
        wishlistEmpty.style.display = "none";
        wishlistError.style.display = "none";

        wishlistContainer.style.display = "grid";


        wishlistContainer.innerHTML =
            wishlistFoods.map(food => {

                const foodId =
                    String(food._id);

                const image =
                    getImageURL(food.image);


                return `
                    <article
                        class="wishlist-card"
                        data-id="${escapeHTML(foodId)}"
                    >

                        <div class="wishlist-card-image">

                            <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(food.name)}"
                                loading="lazy"
                                onerror="
                                    this.onerror=null;
                                    this.src='images/burggylogo.png';
                                "
                            >

                            <button
                                type="button"
                                class="wishlist-remove"
                                data-action="remove"
                                data-id="${escapeHTML(foodId)}"
                                aria-label="Remove ${escapeHTML(food.name)} from wishlist"
                                title="Remove from wishlist"
                            >
                                <i class="fa-solid fa-heart"></i>
                            </button>

                        </div>


                        <div class="wishlist-card-content">

                            <span class="wishlist-category">
                                ${escapeHTML(
                                    food.category ||
                                    "Burggy Special"
                                )}
                            </span>


                            <h3>
                                ${escapeHTML(food.name)}
                            </h3>


                            <p>
                                ${escapeHTML(
                                    food.description ||
                                    "Freshly prepared at Burggy."
                                )}
                            </p>


                            <div class="wishlist-card-bottom">

                                <strong class="wishlist-price">
                                    ${formatPrice(food.price)}
                                </strong>


                                <button
                                    type="button"
                                    class="wishlist-add-btn"
                                    data-action="cart"
                                    data-id="${escapeHTML(foodId)}"
                                >
                                    <i class="fa-solid fa-bag-shopping"></i>
                                    Add to Cart
                                </button>

                            </div>

                        </div>

                    </article>
                `;

            }).join("");

    }


    /* =====================================================
       REMOVE FROM WISHLIST
    ===================================================== */

    function removeFromWishlist(foodId) {

        const food =
            foods.find(
                item =>
                    String(item._id) ===
                    String(foodId)
            );


        wishlist =
            wishlist.filter(
                id =>
                    String(id) !==
                    String(foodId)
            );


        saveWishlist();


        if (food) {

            showToast(
                `${food.name} removed from wishlist.`
            );

        }


        if (wishlist.length === 0) {

            showEmpty();

        } else {

            renderWishlist();

        }

    }


    /* =====================================================
       ADD TO CART
    ===================================================== */

    async function addToCart(foodId) {

        const food =
            foods.find(
                item =>
                    String(item._id) ===
                    String(foodId)
            );


        if (!food) {

            showToast(
                "Food item is no longer available."
            );

            return;

        }


        /*
         * Use the existing global cart function
         * when available.
         */

        if (
            typeof window.addToCart ===
            "function"
        ) {

            try {

                await window.addToCart(foodId);

                showToast(
                    `${food.name} added to cart.`
                );

                return;

            } catch (error) {

                console.error(
                    "Global cart error:",
                    error
                );

            }

        }


        /*
         * Fallback for pages where cart.js
         * is not loaded.
         */

        const user =
            JSON.parse(
                localStorage.getItem(
                    "burggyUser"
                ) || "null"
            );


        if (!user || !user._id) {

            showToast(
                "Please login to add items to cart."
            );

            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 900);

            return;

        }


        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/cart/add",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            userId: user._id,
                            foodId: foodId,
                            quantity: 1
                        })

                    }
                );


            const data =
                await response.json()
                    .catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to add to cart"
                );

            }


            showToast(
                `${food.name} added to cart.`
            );


            updateCartCount();

        } catch (error) {

            console.error(
                "Cart error:",
                error
            );

            showToast(
                error.message ||
                "Unable to add item to cart."
            );

        }

    }


    /* =====================================================
       CART COUNT
    ===================================================== */

    async function updateCartCount() {

        const user =
            JSON.parse(
                localStorage.getItem(
                    "burggyUser"
                ) || "null"
            );


        if (!user || !user._id) {
            return;
        }


        try {

            const response =
                await fetch(
                    `http://localhost:5000/api/cart/${user._id}`
                );


            if (!response.ok) {
                return;
            }


            const data =
                await response.json();


            const items =
                Array.isArray(data.items)
                    ? data.items
                    : [];


            const count =
                items.reduce(
                    (total, item) =>
                        total +
                        Number(item.quantity || 0),
                    0
                );


            document
                .querySelectorAll(
                    "[data-cart-count]"
                )
                .forEach(element => {

                    element.textContent = count;

                });


        } catch (error) {

            console.log(
                "Cart count unavailable."
            );

        }

    }


    /* =====================================================
       EVENT DELEGATION
    ===================================================== */

    if (wishlistContainer) {

        wishlistContainer.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );


                if (!button) {
                    return;
                }


                const action =
                    button.dataset.action;


                const foodId =
                    button.dataset.id;


                if (!foodId) {
                    return;
                }


                if (action === "remove") {

                    removeFromWishlist(
                        foodId
                    );

                }


                if (action === "cart") {

                    addToCart(
                        foodId
                    );

                }

            }
        );

    }


    /* =====================================================
       RETRY
    ===================================================== */

    if (retryWishlist) {

        retryWishlist.addEventListener(
            "click",
            loadWishlist
        );

    }


    /* =====================================================
       GLOBAL WISHLIST FUNCTIONS
    ===================================================== */

    window.removeFromWishlist =
        removeFromWishlist;

    window.addWishlistToCart =
        addToCart;


    window.burggyWishlist = {

        load: loadWishlist,

        remove:
            removeFromWishlist,

        addToCart:

            addToCart

    };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    loadWishlist();

});