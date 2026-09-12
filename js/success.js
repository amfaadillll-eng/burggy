/* =========================================================
   BURGGY
   SUCCESS PAGE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const API_BASE = "http://localhost:5000/api";

    const orderIdElement = document.getElementById("orderId");
    const customerNameElement = document.getElementById("customerName");
    const customerPhoneElement = document.getElementById("customerPhone");
    const customerCityElement = document.getElementById("customerCity");
    const paymentMethodElement = document.getElementById("paymentMethod");
    const deliveryAddressElement = document.getElementById("deliveryAddress");

    const successItems = document.getElementById("successItems");
    const itemCount = document.getElementById("itemCount");
    const orderTotal = document.getElementById("orderTotal");

    const cartCountElements = document.querySelectorAll(
        ".cart-count, #cartCount"
    );

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
        const amount = Number(value) || 0;

        return `₹${amount.toLocaleString("en-IN")}`;
    }


    function getImageUrl(image) {

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

        if (image.startsWith("/uploads/")) {
            return `http://localhost:5000${image}`;
        }

        if (image.startsWith("/")) {
            return `http://localhost:5000${image}`;
        }

        return image;
    }


    function getLastOrder() {

        try {
            const savedOrder =
                localStorage.getItem("burggyLastOrder");

            if (!savedOrder) {
                return null;
            }

            return JSON.parse(savedOrder);

        } catch (error) {

            console.error(
                "Unable to read saved order:",
                error
            );

            return null;
        }
    }


    function showMessage(message) {

        let messageBox =
            document.querySelector(".success-message");

        if (!messageBox) {

            messageBox = document.createElement("div");

            messageBox.className =
                "success-message";

            const card =
                document.querySelector(".success-card");

            if (card) {
                card.prepend(messageBox);
            }
        }

        messageBox.textContent = message;
        messageBox.style.display = "block";
    }


    function hideMessage() {

        const messageBox =
            document.querySelector(".success-message");

        if (messageBox) {
            messageBox.style.display = "none";
        }
    }


    /* =====================================================
       CART COUNT
    ===================================================== */

    function updateCartCount(count = 0) {

        cartCountElements.forEach(element => {
            element.textContent = count;
        });

        localStorage.setItem(
            "burggyCartCount",
            String(count)
        );
    }


    /*
       The checkout page clears the server cart after
       successful order creation, so the success page
       should normally display zero.
    */

    updateCartCount(0);


    /* =====================================================
       PAYMENT METHOD
    ===================================================== */

    function formatPaymentMethod(method) {

        if (!method) {
            return "Cash on Delivery";
        }

        const value =
            String(method).toLowerCase();

        if (
            value === "online" ||
            value === "upi" ||
            value === "card"
        ) {
            return "Online Payment";
        }

        if (
            value === "cod" ||
            value === "cash"
        ) {
            return "Cash on Delivery";
        }

        return String(method);
    }


    /* =====================================================
       RENDER ORDER
    ===================================================== */

    function renderOrder(order) {

        if (!order) {

            showMessage(
                "Order details could not be found."
            );

            if (successItems) {
                successItems.innerHTML = `
                    <div class="success-empty">
                        <i class="fa-solid fa-receipt"></i>
                        <p>
                            Your order was placed, but
                            the saved confirmation details
                            are unavailable.
                        </p>
                    </div>
                `;
            }

            return;
        }

        hideMessage();


        /* -------------------------------------------------
           ORDER ID
        ------------------------------------------------- */

        if (orderIdElement) {

            const id =
                order._id ||
                order.id ||
                order.orderId ||
                "BURGGY";

            const shortId =
                String(id).length > 14
                    ? String(id).slice(-8).toUpperCase()
                    : String(id).toUpperCase();

            orderIdElement.textContent =
                `#${shortId}`;
        }


        /* -------------------------------------------------
           CUSTOMER
        ------------------------------------------------- */

        if (customerNameElement) {

            customerNameElement.textContent =
                order.customerName ||
                order.name ||
                "Customer";
        }


        if (customerPhoneElement) {

            customerPhoneElement.textContent =
                order.phone ||
                "Not provided";
        }


        if (customerCityElement) {

            customerCityElement.textContent =
                order.city ||
                "Not provided";
        }


        /* -------------------------------------------------
           PAYMENT
        ------------------------------------------------- */

        if (paymentMethodElement) {

            paymentMethodElement.textContent =
                formatPaymentMethod(
                    order.paymentMethod
                );
        }


        /* -------------------------------------------------
           ADDRESS
        ------------------------------------------------- */

        if (deliveryAddressElement) {

            deliveryAddressElement.textContent =
                order.address ||
                "Delivery address not available";
        }


        /* -------------------------------------------------
           ITEMS
        ------------------------------------------------- */

        renderItems(order);


        /* -------------------------------------------------
           TOTAL
        ------------------------------------------------- */

        if (orderTotalElementExists()) {

            const total =
                Number(order.totalAmount) || 0;

            orderTotal.textContent =
                formatPrice(total);
        }
    }


    function orderTotalElementExists() {
        return Boolean(orderTotal);
    }


    /* =====================================================
       RENDER ITEMS
    ===================================================== */

    function renderItems(order) {

        if (!successItems) {
            return;
        }

        const items =
            Array.isArray(order.items)
                ? order.items
                : [];

        if (items.length === 0) {

            successItems.innerHTML = `
                <div class="success-empty">
                    <i class="fa-solid fa-burger"></i>
                    <p>No item details available.</p>
                </div>
            `;

            if (itemCount) {
                itemCount.textContent = "0 items";
            }

            return;
        }


        let totalQuantity = 0;

        successItems.innerHTML =
            items.map(item => {

                const quantity =
                    Math.max(
                        1,
                        Number(item.quantity) || 1
                    );

                totalQuantity += quantity;


                /*
                   Depending on how the order was saved,
                   food can be:

                   1. Object
                   2. MongoDB ObjectId string
                   3. Object with populated food data
                */

                const food =
                    item.food &&
                    typeof item.food === "object"
                        ? item.food
                        : null;


                const name =
                    item.name ||
                    food?.name ||
                    "Food Item";


                const price =
                    Number(
                        item.price ??
                        food?.price ??
                        0
                    );


                const image =
                    item.image ||
                    food?.image ||
                    "";


                const itemTotal =
                    price * quantity;


                return `
                    <div class="success-item">

                        <div class="success-item-image">
                            <img
                                src="${escapeHTML(
                                    getImageUrl(image)
                                )}"
                                alt="${escapeHTML(name)}"
                                loading="lazy"
                                onerror="
                                    this.onerror=null;
                                    this.src='images/burggylogo.png';
                                "
                            >
                        </div>

                        <div class="success-item-info">
                            <h4>
                                ${escapeHTML(name)}
                            </h4>

                            <p>
                                ${quantity} × ${formatPrice(price)}
                            </p>
                        </div>

                        <div class="success-item-price">
                            ${formatPrice(itemTotal)}
                        </div>

                    </div>
                `;

            }).join("");


        /* -------------------------------------------------
           ITEM COUNT
        ------------------------------------------------- */

        if (itemCount) {

            itemCount.textContent =
                `${totalQuantity} ${
                    totalQuantity === 1
                        ? "item"
                        : "items"
                }`;
        }
    }


    /* =====================================================
       LOAD ORDER FROM LOCAL STORAGE
    ===================================================== */

    const order = getLastOrder();

    if (order) {
        renderOrder(order);
    } else {

        /*
           Small fallback:
           If localStorage does not contain the order,
           try to get the most recent order for the user.
           
           This is only a fallback. The backend currently
           returns all orders from GET /api/orders.
        */

        loadLatestOrder();
    }


    /* =====================================================
       FALLBACK — LOAD LATEST ORDER
    ===================================================== */

    async function loadLatestOrder() {

        const userData =
            localStorage.getItem("burggyUser");

        if (!userData) {
            renderOrder(null);
            return;
        }

        let user;

        try {
            user = JSON.parse(userData);
        } catch (error) {
            console.error(error);
            renderOrder(null);
            return;
        }

        if (!user?._id) {
            renderOrder(null);
            return;
        }

        try {

            const response =
                await fetch(`${API_BASE}/orders`);

            if (!response.ok) {
                throw new Error(
                    "Unable to load orders"
                );
            }

            const orders =
                await response.json();

            if (!Array.isArray(orders)) {
                renderOrder(null);
                return;
            }


            /*
               Find orders belonging to the logged-in user.
            */

            const userOrders =
                orders.filter(order =>
                    String(order.userId) ===
                    String(user._id)
                );


            if (userOrders.length === 0) {
                renderOrder(null);
                return;
            }


            /*
               Sort newest first.
            */

            userOrders.sort((a, b) => {

                const dateA =
                    new Date(
                        a.createdAt || 0
                    ).getTime();

                const dateB =
                    new Date(
                        b.createdAt || 0
                    ).getTime();

                return dateB - dateA;
            });


            const latestOrder =
                userOrders[0];


            localStorage.setItem(
                "burggyLastOrder",
                JSON.stringify(latestOrder)
            );


            renderOrder(latestOrder);

        } catch (error) {

            console.error(
                "Unable to load latest order:",
                error
            );

            renderOrder(null);
        }
    }


    /* =====================================================
       ORDER MORE
    ===================================================== */

    const orderMoreButton =
        document.querySelector(
            ".success-actions .btn-primary"
        );

    if (orderMoreButton) {

        orderMoreButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "menu.html";
            }
        );
    }


    /* =====================================================
       BACK TO HOME
    ===================================================== */

    const homeButton =
        document.querySelector(
            ".success-actions .btn-outline"
        );

    if (homeButton) {

        homeButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "index.html";
            }
        );
    }


    /* =====================================================
       PREVENT DUPLICATE BUTTON SUBMISSIONS
    ===================================================== */

    document.querySelectorAll(
        ".success-actions .btn"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                button.style.pointerEvents =
                    "none";

                setTimeout(() => {
                    button.style.pointerEvents =
                        "";
                }, 1200);
            }
        );

    });


    /* =====================================================
       PAGE LOAD ANIMATION
    ===================================================== */

    requestAnimationFrame(() => {

        document.body.classList.add(
            "success-page-loaded"
        );

    });


    /* =====================================================
       CONSOLE
    ===================================================== */

    console.log(
        "🍔 Burggy success page loaded successfully."
    );

});