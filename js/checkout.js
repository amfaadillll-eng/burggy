/* =========================================================
   BURGGY
   CHECKOUT JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const API_BASE = "http://localhost:5000/api";
    const CART_API = `${API_BASE}/cart`;
    const ORDER_API = `${API_BASE}/orders/create`;
    const DELIVERY_CHARGE = 30;

    const checkoutForm = document.getElementById("checkoutForm");
    const checkoutItems = document.getElementById("checkoutItems");

    const subtotalElement = document.getElementById("checkoutSubtotal");
    const deliveryElement = document.getElementById("checkoutDelivery");
    const totalElement = document.getElementById("checkoutTotal");

    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const messageElement = document.getElementById("checkoutMessage");

    let cartItems = [];


    /* =====================================================
       GET LOGGED-IN USER
    ===================================================== */

    function getUser() {

        try {

            const user = JSON.parse(
                localStorage.getItem("burggyUser")
            );

            return user;

        } catch (error) {

            console.error("Unable to read user:", error);

            return null;

        }

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       IMAGE URL
    ===================================================== */

    function getImageURL(image) {

        if (!image) {
            return "images/burggylogo.png";
        }

        if (
            image.startsWith("http://") ||
            image.startsWith("https://") ||
            image.startsWith("data:")
        ) {
            return image;
        }

        if (image.startsWith("/")) {
            return `http://localhost:5000${image}`;
        }

        return image;

    }


    /* =====================================================
       FORMAT PRICE
    ===================================================== */

    function formatPrice(amount) {

        return `₹${Number(amount || 0).toFixed(2)}`;

    }


    /* =====================================================
       SHOW MESSAGE
    ===================================================== */

    function showMessage(message, type = "error") {

        if (!messageElement) return;

        messageElement.textContent = message;

        messageElement.className =
            `checkout-message ${type}`;

        messageElement.style.display = "block";

    }


    /* =====================================================
       HIDE MESSAGE
    ===================================================== */

    function hideMessage() {

        if (!messageElement) return;

        messageElement.textContent = "";
        messageElement.style.display = "none";

    }


    /* =====================================================
       UPDATE CART COUNT
    ===================================================== */

    function updateCartCount() {

        const countElements =
            document.querySelectorAll(
                "#cartCount, .cart-count"
            );

        const count = cartItems.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );

        countElements.forEach(element => {
            element.textContent = count;
        });

    }


    /* =====================================================
       LOAD CART
    ===================================================== */

    async function loadCart() {

        const user = getUser();

        if (!user || !user._id) {

            showLoginRequired();

            return;

        }


        try {

            if (checkoutItems) {

                checkoutItems.innerHTML = `
                    <div class="checkout-loading">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        <span>Loading your order...</span>
                    </div>
                `;

            }


            const response = await fetch(
                `${CART_API}/${encodeURIComponent(user._id)}`
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to load cart."
                );

            }


            /*
             * cartRoutes returns either:
             *
             * [
             *   { food: {...}, quantity: 2 }
             * ]
             *
             * or an object containing cart.
             */

            if (Array.isArray(data)) {

                cartItems = data;

            } else if (Array.isArray(data.cart)) {

                cartItems = data.cart;

            } else {

                cartItems = [];

            }


            renderCheckoutItems();

            updateSummary();

            updateCartCount();


        } catch (error) {

            console.error("Checkout cart error:", error);

            cartItems = [];

            if (checkoutItems) {

                checkoutItems.innerHTML = `
                    <div class="checkout-empty">
                        <i class="fa-solid fa-circle-exclamation"></i>
                        <h3>Unable to load your cart</h3>
                        <p>Please go back to your cart and try again.</p>

                        <a href="cart.html" class="btn btn-primary">
                            Back to Cart
                        </a>
                    </div>
                `;

            }

            showMessage(
                "Unable to load your cart. Please try again.",
                "error"
            );

        }

    }


    /* =====================================================
       RENDER CHECKOUT ITEMS
    ===================================================== */

    function renderCheckoutItems() {

        if (!checkoutItems) return;


        if (!cartItems.length) {

            checkoutItems.innerHTML = `
                <div class="checkout-empty">

                    <div class="checkout-empty-icon">
                        <i class="fa-solid fa-basket-shopping"></i>
                    </div>

                    <h3>Your cart is empty</h3>

                    <p>
                        Add some delicious food before checking out.
                    </p>

                    <a href="menu.html" class="btn btn-primary">
                        Browse Menu
                    </a>

                </div>
            `;

            if (placeOrderBtn) {
                placeOrderBtn.disabled = true;
            }

            return;

        }


        checkoutItems.innerHTML = cartItems
            .map(item => {

                const food = item.food || {};

                const quantity =
                    Number(item.quantity || 1);

                const price =
                    Number(food.price || item.price || 0);

                const itemTotal =
                    price * quantity;


                return `
                    <div class="checkout-item">

                        <div class="checkout-item-image">

                            <img
                                src="${escapeHTML(
                                    getImageURL(food.image)
                                )}"
                                alt="${escapeHTML(
                                    food.name || "Food item"
                                )}"
                                loading="lazy"
                                onerror="this.src='images/burggylogo.png'"
                            >

                        </div>


                        <div class="checkout-item-info">

                            <h4>
                                ${escapeHTML(
                                    food.name || "Food item"
                                )}
                            </h4>

                            <span>
                                Qty: ${quantity}
                            </span>

                        </div>


                        <div class="checkout-item-price">

                            ${formatPrice(itemTotal)}

                        </div>

                    </div>
                `;

            })
            .join("");


        if (placeOrderBtn) {
            placeOrderBtn.disabled = false;
        }

    }


    /* =====================================================
       CALCULATE SUBTOTAL
    ===================================================== */

    function calculateSubtotal() {

        return cartItems.reduce(
            (total, item) => {

                const food = item.food || {};

                const price =
                    Number(food.price || item.price || 0);

                const quantity =
                    Number(item.quantity || 1);

                return total + (price * quantity);

            },
            0
        );

    }


    /* =====================================================
       UPDATE ORDER SUMMARY
    ===================================================== */

    function updateSummary() {

        const subtotal =
            calculateSubtotal();

        const delivery =
            cartItems.length ? DELIVERY_CHARGE : 0;

        const total =
            subtotal + delivery;


        if (subtotalElement) {
            subtotalElement.textContent =
                formatPrice(subtotal);
        }


        if (deliveryElement) {
            deliveryElement.textContent =
                formatPrice(delivery);
        }


        if (totalElement) {
            totalElement.textContent =
                formatPrice(total);
        }

    }


    /* =====================================================
       SHOW LOGIN REQUIRED
    ===================================================== */

    function showLoginRequired() {

        if (checkoutItems) {

            checkoutItems.innerHTML = `
                <div class="checkout-empty">

                    <div class="checkout-empty-icon">
                        <i class="fa-solid fa-user-lock"></i>
                    </div>

                    <h3>Login required</h3>

                    <p>
                        Please login to continue with your order.
                    </p>

                    <a href="login.html" class="btn btn-primary">
                        Login to Continue
                    </a>

                </div>
            `;

        }


        if (placeOrderBtn) {
            placeOrderBtn.disabled = true;
        }

    }


    /* =====================================================
       SET BUTTON LOADING
    ===================================================== */

    function setButtonLoading(isLoading) {

        if (!placeOrderBtn) return;


        if (isLoading) {

            placeOrderBtn.disabled = true;

            placeOrderBtn.dataset.originalText =
                placeOrderBtn.innerHTML;

            placeOrderBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Placing Order...
            `;

        } else {

            placeOrderBtn.disabled = false;

            if (placeOrderBtn.dataset.originalText) {

                placeOrderBtn.innerHTML =
                    placeOrderBtn.dataset.originalText;

            }

        }

    }


    /* =====================================================
       PLACE ORDER
    ===================================================== */

    async function placeOrder(event) {

        event.preventDefault();

        hideMessage();


        const user = getUser();


        if (!user || !user._id) {

            showMessage(
                "Please login before placing your order.",
                "error"
            );

            return;

        }


        if (!cartItems.length) {

            showMessage(
                "Your cart is empty.",
                "error"
            );

            return;

        }


        /*
         * Read customer details from checkout form.
         */

        const customerName =
            document.getElementById("name")?.value.trim();

        const phone =
            document.getElementById("phone")?.value.trim();

        const address =
            document.getElementById("address")?.value.trim();

        const city =
            document.getElementById("city")?.value.trim();

        const pincode =
            document.getElementById("pincode")?.value.trim();

        const instructions =
            document.getElementById("instructions")?.value.trim();


        const paymentMethodElement =
            document.querySelector(
                'input[name="paymentMethod"]:checked'
            );


        const paymentMethod =
            paymentMethodElement
                ? paymentMethodElement.value
                : "cod";


        /* =================================================
           BASIC VALIDATION
        ================================================= */

        if (!customerName) {

            showMessage(
                "Please enter your name.",
                "error"
            );

            document.getElementById("name")?.focus();

            return;

        }


        if (!phone) {

            showMessage(
                "Please enter your phone number.",
                "error"
            );

            document.getElementById("phone")?.focus();

            return;

        }


        if (!address) {

            showMessage(
                "Please enter your delivery address.",
                "error"
            );

            document.getElementById("address")?.focus();

            return;

        }


        if (!city) {

            showMessage(
                "Please enter your city.",
                "error"
            );

            document.getElementById("city")?.focus();

            return;

        }


        if (!pincode) {

            showMessage(
                "Please enter your pincode.",
                "error"
            );

            document.getElementById("pincode")?.focus();

            return;

        }


        /* =================================================
           PREPARE ORDER ITEMS
        ================================================= */

        const orderItems = cartItems.map(item => {

            const food = item.food || {};

            return {

                food: food._id || item.food,

                name: food.name || item.name || "Food item",

                price: Number(
                    food.price || item.price || 0
                ),

                quantity: Number(
                    item.quantity || 1
                )

            };

        });


        const subtotal =
            calculateSubtotal();

        const delivery =
            DELIVERY_CHARGE;

        const totalAmount =
            subtotal + delivery;


        /*
         * The backend order route accepts:
         *
         * userId
         * customerName
         * phone
         * address
         * city
         * items
         * totalAmount
         * paymentMethod
         */

        const orderData = {

            userId: user._id,

            customerName,

            phone,

            address:
                pincode
                    ? `${address}, ${pincode}`
                    : address,

            city,

            items: orderItems,

            totalAmount,

            paymentMethod

        };


        /* =================================================
           ADD OPTIONAL DELIVERY INSTRUCTIONS
           ONLY IF YOUR ORDER MODEL SUPPORTS IT
        ================================================= */

        /*
         * Your current orderRoutes.js does NOT explicitly
         * destructure "instructions", so we intentionally
         * do not send it here.
         *
         * This prevents sending data that the current backend
         * contract does not use.
         */


        try {

            setButtonLoading(true);


            const response = await fetch(
                ORDER_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(orderData)

                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to place order."
                );

            }


            console.log(
                "Order created successfully:",
                data.order
            );


            /*
             * Clear the MongoDB cart after successful
             * order creation.
             */

            try {

                await fetch(
                    `${CART_API}/clear/${encodeURIComponent(
                        user._id
                    )}`,
                    {
                        method: "DELETE"
                    }
                );

            } catch (clearError) {

                /*
                 * Order is already successfully created.
                 * Do not show an order failure just because
                 * cart clearing failed.
                 */

                console.warn(
                    "Cart could not be cleared:",
                    clearError
                );

            }


            /*
             * Save order information locally so the
             * success page can display it.
             */

            if (data.order) {

                localStorage.setItem(
                    "burggyLastOrder",
                    JSON.stringify(data.order)
                );

            }


            localStorage.removeItem(
                "burggyCart"
            );


            /*
             * Redirect to success page.
             */

            window.location.href =
                "success.html";


        } catch (error) {

            console.error(
                "Order placement error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to place your order. Please try again.",
                "error"
            );


            setButtonLoading(false);

        }

    }


    /* =====================================================
       FORM SUBMIT
    ===================================================== */

    if (checkoutForm) {

        checkoutForm.addEventListener(
            "submit",
            placeOrder
        );

    }


    /* =====================================================
       PAYMENT METHOD UI
    ===================================================== */

    const paymentOptions =
        document.querySelectorAll(
            ".payment-option"
        );


    paymentOptions.forEach(option => {

        const radio =
            option.querySelector(
                'input[type="radio"]'
            );


        if (!radio) return;


        radio.addEventListener(
            "change",
            () => {

                paymentOptions.forEach(item => {

                    item.classList.remove(
                        "selected"
                    );

                });


                option.classList.add(
                    "selected"
                );

            }
        );


        if (radio.checked) {

            option.classList.add(
                "selected"
            );

        }

    });


    /* =====================================================
       PHONE INPUT
    ===================================================== */

    const phoneInput =
        document.getElementById("phone");


    if (phoneInput) {

        phoneInput.addEventListener(
            "input",
            () => {

                phoneInput.value =
                    phoneInput.value.replace(
                        /[^0-9+\-\s]/g,
                        ""
                    );

            }
        );

    }


    /* =====================================================
       PINCODE INPUT
    ===================================================== */

    const pincodeInput =
        document.getElementById("pincode");


    if (pincodeInput) {

        pincodeInput.addEventListener(
            "input",
            () => {

                pincodeInput.value =
                    pincodeInput.value.replace(
                        /\D/g,
                        ""
                    ).slice(0, 6);

            }
        );

    }


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadCart();

});