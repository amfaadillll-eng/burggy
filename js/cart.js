// =========================================================
// BURGGY — CART JAVASCRIPT
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    const API_BASE = "http://localhost:5000/api";
    const DELIVERY_CHARGE = 30;

    const cartItemsContainer = document.querySelector(".cart-items");
    const summary = document.querySelector(".summary");
    const checkoutButton = document.querySelector(".checkout");

    let currentCart = [];

    // =====================================================
    // USER
    // =====================================================

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem("burggyUser"));
        } catch {
            return null;
        }
    }

    // =====================================================
    // HELPERS
    // =====================================================

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getImageUrl(image) {

        if (!image) {
            return "images/burger1.png";
        }

        if (
            image.startsWith("http://") ||
            image.startsWith("https://") ||
            image.startsWith("data:")
        ) {
            return image;
        }

        if (image.startsWith("/uploads/")) {
            return "http://localhost:5000" + image;
        }

        if (image.startsWith("uploads/")) {
            return "http://localhost:5000/" + image;
        }

        return image;
    }

    function formatPrice(price) {
        return `₹${Number(price || 0).toFixed(0)}`;
    }

    // =====================================================
    // TOAST
    // =====================================================

    function showToast(message) {

        let toast = document.getElementById("burggyToast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "burggyToast";

            toast.style.position = "fixed";
            toast.style.bottom = "25px";
            toast.style.left = "50%";
            toast.style.transform = "translateX(-50%) translateY(20px)";
            toast.style.background = "#111";
            toast.style.color = "#fff";
            toast.style.padding = "13px 20px";
            toast.style.borderRadius = "999px";
            toast.style.fontSize = "14px";
            toast.style.fontWeight = "600";
            toast.style.zIndex = "9999";
            toast.style.opacity = "0";
            toast.style.transition = "all .3s ease";
            toast.style.border = "1px solid rgba(255,255,255,.12)";
            toast.style.boxShadow = "0 15px 40px rgba(0,0,0,.35)";

            document.body.appendChild(toast);
        }

        toast.textContent = message;

        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform =
                "translateX(-50%) translateY(0)";
        });

        clearTimeout(toast.hideTimer);

        toast.hideTimer = setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform =
                "translateX(-50%) translateY(20px)";
        }, 2200);
    }

    // =====================================================
    // CART COUNT
    // =====================================================

    function updateCartCount() {

        const totalQuantity = currentCart.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );

        const possibleCounters = document.querySelectorAll(
            ".cart-count, #cartCount, [data-cart-count]"
        );

        possibleCounters.forEach(counter => {
            counter.textContent = totalQuantity;
            counter.style.display =
                totalQuantity > 0 ? "flex" : "none";
        });
    }

    // =====================================================
    // LOADING
    // =====================================================

    function showLoading() {

        cartItemsContainer.innerHTML = `
            <div class="cart-loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Loading your cart...</span>
            </div>
        `;
    }

    // =====================================================
    // LOGIN REQUIRED
    // =====================================================

    function showLoginRequired() {

        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">
                    <i class="fa-solid fa-lock"></i>
                </div>

                <h2>Login Required</h2>

                <p>
                    Please login to view and manage your Burggy cart.
                </p>

                <a href="login.html" class="btn btn-primary">
                    Login to Continue
                </a>
            </div>
        `;

        updateSummary(0);

        if (checkoutButton) {
            checkoutButton.disabled = true;
            checkoutButton.style.opacity = "0.5";
            checkoutButton.style.cursor = "not-allowed";
        }
    }

    // =====================================================
    // EMPTY CART
    // =====================================================

    function showEmptyCart() {

        cartItemsContainer.innerHTML = `
            <div class="cart-empty">

                <div class="cart-empty-icon">
                    <i class="fa-solid fa-basket-shopping"></i>
                </div>

                <h2>Your cart is empty</h2>

                <p>
                    Looks like you haven't added anything yet.
                </p>

                <a href="menu.html" class="btn btn-primary">
                    Explore Menu
                </a>

            </div>
        `;

        updateSummary(0);

        if (checkoutButton) {
            checkoutButton.disabled = true;
            checkoutButton.style.opacity = "0.5";
            checkoutButton.style.cursor = "not-allowed";
        }
    }

    // =====================================================
    // LOAD CART
    // =====================================================

    async function loadCart() {

        const user = getUser();

        if (!user || !user._id) {
            showLoginRequired();
            return;
        }

        showLoading();

        try {

            const response = await fetch(
                `${API_BASE}/cart/${user._id}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load cart"
                );
            }

            currentCart = Array.isArray(data.cart)
                ? data.cart
                : [];

            updateCartCount();

            if (currentCart.length === 0) {
                showEmptyCart();
                return;
            }

            renderCart();

        } catch (error) {

            console.error("Cart loading error:", error);

            cartItemsContainer.innerHTML = `
                <div class="cart-empty">

                    <div class="cart-empty-icon">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>

                    <h2>Unable to load cart</h2>

                    <p>
                        Please make sure the Burggy server is running
                        and try again.
                    </p>

                    <button
                        class="btn btn-primary"
                        id="retryCart"
                    >
                        Try Again
                    </button>

                </div>
            `;

            updateSummary(0);
        }
    }

    // =====================================================
    // RENDER CART
    // =====================================================

    function renderCart() {

        if (!currentCart.length) {
            showEmptyCart();
            return;
        }

        cartItemsContainer.innerHTML = currentCart.map(item => {

            const food = item.food;

            if (!food) {
                return "";
            }

            const foodId = food._id;
            const name = escapeHTML(food.name);
            const description = escapeHTML(
                food.description || "Freshly prepared by Burggy."
            );

            const price = Number(food.price || 0);
            const quantity = Number(item.quantity || 1);

            const total = price * quantity;

            const image = escapeHTML(
                getImageUrl(food.image)
            );

            return `
                <article
                    class="cart-card"
                    data-food-id="${escapeHTML(foodId)}"
                >

                    <div class="cart-card-image">
                        <img
                            src="${image}"
                            alt="${name}"
                            onerror="this.src='images/burger1.png'"
                        >
                    </div>

                    <div class="item-details">

                        <div class="item-main">

                            <h3>${name}</h3>

                            <p class="item-description">
                                ${description}
                            </p>

                            <p class="item-unit-price">
                                ${formatPrice(price)} each
                            </p>

                        </div>

                        <div class="quantity">

                            <button
                                type="button"
                                class="quantity-btn"
                                data-action="decrease"
                                data-food-id="${escapeHTML(foodId)}"
                                aria-label="Decrease quantity"
                            >
                                <i class="fa-solid fa-minus"></i>
                            </button>

                            <span class="quantity-value">
                                ${quantity}
                            </span>

                            <button
                                type="button"
                                class="quantity-btn"
                                data-action="increase"
                                data-food-id="${escapeHTML(foodId)}"
                                aria-label="Increase quantity"
                            >
                                <i class="fa-solid fa-plus"></i>
                            </button>

                        </div>

                    </div>

                    <div class="cart-card-right">

                        <div class="item-price">
                            ${formatPrice(total)}
                        </div>

                        <button
                            type="button"
                            class="remove-item"
                            data-action="remove"
                            data-food-id="${escapeHTML(foodId)}"
                            aria-label="Remove ${name}"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>

                </article>
            `;

        }).join("");

        updateSummary();
        updateCartCount();

        if (checkoutButton) {
            checkoutButton.disabled = false;
            checkoutButton.style.opacity = "1";
            checkoutButton.style.cursor = "pointer";
        }
    }

    // =====================================================
    // SUMMARY
    // =====================================================

    function updateSummary() {

        const subtotal = currentCart.reduce(
            (total, item) => {

                if (!item.food) {
                    return total;
                }

                return total +
                    Number(item.food.price || 0) *
                    Number(item.quantity || 0);

            },
            0
        );

        updateSummaryValues(subtotal);
    }

    function updateSummaryValues(subtotal) {

        const delivery =
            subtotal > 0 ? DELIVERY_CHARGE : 0;

        const total = subtotal + delivery;

        if (!summary) {
            return;
        }

        const summaryRows =
            summary.querySelectorAll(".summary-row");

        if (summaryRows.length >= 1) {

            const subtotalValue =
                summaryRows[0].querySelector("span:last-child");

            if (subtotalValue) {
                subtotalValue.textContent =
                    formatPrice(subtotal);
            }
        }

        if (summaryRows.length >= 2) {

            const deliveryValue =
                summaryRows[1].querySelector("span:last-child");

            if (deliveryValue) {
                deliveryValue.textContent =
                    formatPrice(delivery);
            }
        }

        const totalValue =
            summary.querySelector(
                ".total span:last-child"
            );

        if (totalValue) {
            totalValue.textContent =
                formatPrice(total);
        }
    }

    // =====================================================
    // UPDATE QUANTITY
    // =====================================================

    async function updateQuantity(foodId, newQuantity) {

        const user = getUser();

        if (!user || !user._id) {
            showLoginRequired();
            return;
        }

        if (newQuantity < 1) {
            await removeItem(foodId);
            return;
        }

        const card =
            document.querySelector(
                `.cart-card[data-food-id="${CSS.escape(foodId)}"]`
            );

        if (card) {
            card.classList.add("cart-updating");
        }

        try {

            const response = await fetch(
                `${API_BASE}/cart/update`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        userId: user._id,
                        foodId: foodId,
                        quantity: newQuantity
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update quantity"
                );
            }

            const item = currentCart.find(
                cartItem =>
                    cartItem.food &&
                    cartItem.food._id === foodId
            );

            if (item) {
                item.quantity = newQuantity;
            }

            renderCart();

        } catch (error) {

            console.error(
                "Quantity update error:",
                error
            );

            showToast("Unable to update quantity ❌");
        }
    }

    // =====================================================
    // REMOVE ITEM
    // =====================================================

    async function removeItem(foodId) {

        const user = getUser();

        if (!user || !user._id) {
            showLoginRequired();
            return;
        }

        try {

            const response = await fetch(
                `${API_BASE}/cart/remove`,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        userId: user._id,
                        foodId: foodId
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to remove item"
                );
            }

            currentCart = currentCart.filter(
                item =>
                    !item.food ||
                    item.food._id !== foodId
            );

            updateCartCount();

            if (currentCart.length === 0) {
                showEmptyCart();
            } else {
                renderCart();
            }

            showToast("Item removed from cart");

        } catch (error) {

            console.error(
                "Remove item error:",
                error
            );

            showToast("Unable to remove item ❌");
        }
    }

    // =====================================================
    // CART EVENT DELEGATION
    // =====================================================

    cartItemsContainer.addEventListener(
        "click",
        async event => {

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
                button.dataset.foodId;

            if (!foodId) {
                return;
            }

            const item =
                currentCart.find(
                    cartItem =>
                        cartItem.food &&
                        cartItem.food._id === foodId
                );

            if (!item) {
                return;
            }

            const currentQuantity =
                Number(item.quantity || 1);

            if (action === "increase") {

                await updateQuantity(
                    foodId,
                    currentQuantity + 1
                );

            }

            if (action === "decrease") {

                if (currentQuantity <= 1) {
                    await removeItem(foodId);
                } else {
                    await updateQuantity(
                        foodId,
                        currentQuantity - 1
                    );
                }

            }

            if (action === "remove") {
                await removeItem(foodId);
            }
        }
    );

    // =====================================================
    // RETRY
    // =====================================================

    document.addEventListener(
        "click",
        event => {

            if (
                event.target.closest("#retryCart")
            ) {
                loadCart();
            }
        }
    );

    // =====================================================
    // CHECKOUT
    // =====================================================

    if (checkoutButton) {

        checkoutButton.addEventListener(
            "click",
            () => {

                const user = getUser();

                if (!user || !user._id) {
                    window.location.href =
                        "login.html";
                    return;
                }

                if (currentCart.length === 0) {
                    showToast(
                        "Your cart is empty 🛒"
                    );
                    return;
                }

                window.location.href =
                    "checkout.html";
            }
        );
    }

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    loadCart();

});