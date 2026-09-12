/* =========================================================
   BURGGY ADMIN DASHBOARD
   ORDER MANAGEMENT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIG
    ====================================================== */

    const API_BASE = "http://localhost:5000/api";
    const ORDERS_API = `${API_BASE}/orders`;

    let orders = [];
    let currentFilter = "all";


    /* =====================================================
       ELEMENTS
    ====================================================== */

    const ordersContainer =
        document.getElementById("ordersContainer");

    const ordersEmpty =
        document.getElementById("ordersEmpty");

    const ordersError =
        document.getElementById("ordersError");

    const orderStatusFilter =
        document.getElementById("orderStatusFilter");

    const refreshOrders =
        document.getElementById("refreshOrders");

    const retryOrders =
        document.getElementById("retryOrders");

    const totalOrders =
        document.getElementById("totalOrders");

    const pendingOrders =
        document.getElementById("pendingOrders");

    const preparingOrders =
        document.getElementById("preparingOrders");

    const completedOrders =
        document.getElementById("completedOrders");

    const sidebarOrderCount =
        document.getElementById("sidebarOrderCount");

    const orderModal =
        document.getElementById("orderModal");

    const orderModalBody =
        document.getElementById("orderModalBody");

    const orderModalTitle =
        document.getElementById("orderModalTitle");

    const closeOrderModal =
        document.getElementById("closeOrderModal");

    const orderModalOverlay =
        document.getElementById("orderModalOverlay");

    const adminToast =
        document.getElementById("adminToast");

    const adminToastMessage =
        document.getElementById("adminToastMessage");

    const adminMobileMenu =
        document.getElementById("adminMobileMenu");

    const adminSidebar =
        document.getElementById("adminSidebar");


    /* =====================================================
       SAFE HTML
    ====================================================== */

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


    /* =====================================================
       FORMAT HELPERS
    ====================================================== */

    function formatCurrency(value) {

        const amount = Number(value) || 0;

        return `₹${amount.toLocaleString("en-IN")}`;
    }


    function formatDate(dateValue) {

        if (!dateValue) {
            return "—";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }


    function formatTime(dateValue) {

        if (!dateValue) {
            return "";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }


    function getOrderId(order) {

        if (!order) {
            return "—";
        }

        const id = order._id || order.id || "";

        if (!id) {
            return "—";
        }

        return `#${String(id).slice(-6).toUpperCase()}`;
    }


    function getItemCount(order) {

        if (!order || !Array.isArray(order.items)) {
            return 0;
        }

        return order.items.reduce((total, item) => {
            return total + (Number(item.quantity) || 0);
        }, 0);
    }


    function getStatus(order) {

        return String(order?.status || "pending")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-");
    }


    function formatStatus(status) {

        const labels = {
            pending: "Pending",
            preparing: "Preparing",
            packing: "Packing",
            "out-for-delivery": "Out for Delivery",
            delivered: "Delivered",
            cancelled: "Cancelled"
        };

        return labels[status] || "Pending";
    }


    function formatPayment(payment) {

        const value = String(payment || "cod")
            .toLowerCase();

        if (value === "online") {
            return "Online";
        }

        if (value === "upi") {
            return "UPI";
        }

        return "Cash on Delivery";
    }


    function paymentIcon(payment) {

        const value = String(payment || "cod")
            .toLowerCase();

        if (value === "online" || value === "upi") {
            return "fa-credit-card";
        }

        return "fa-money-bill-wave";
    }


    /* =====================================================
       TOAST
    ====================================================== */

    let toastTimer = null;

    function showToast(message, type = "success") {

        if (!adminToast || !adminToastMessage) {
            return;
        }

        adminToastMessage.textContent = message;

        const icon = adminToast.querySelector("i");

        if (icon) {

            if (type === "error") {
                icon.className =
                    "fa-solid fa-circle-exclamation";
            } else {
                icon.className =
                    "fa-solid fa-circle-check";
            }
        }

        adminToast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            adminToast.classList.remove("show");
        }, 2800);
    }


    /* =====================================================
       LOADING STATE
    ====================================================== */

    function showLoading() {

        if (ordersEmpty) {
            ordersEmpty.hidden = true;
        }

        if (ordersError) {
            ordersError.hidden = true;
        }

        if (!ordersContainer) {
            return;
        }

        ordersContainer.innerHTML = `
            <tr class="admin-loading-row">
                <td colspan="7">

                    <div class="admin-loading">

                        <i class="fa-solid fa-spinner fa-spin"></i>

                        <span>
                            Loading orders...
                        </span>

                    </div>

                </td>
            </tr>
        `;
    }


    /* =====================================================
       ERROR STATE
    ====================================================== */

    function showError() {

        if (ordersContainer) {
            ordersContainer.innerHTML = "";
        }

        if (ordersEmpty) {
            ordersEmpty.hidden = true;
        }

        if (ordersError) {
            ordersError.hidden = false;
        }
    }


    /* =====================================================
       EMPTY STATE
    ====================================================== */

    function showEmpty() {

        if (ordersContainer) {
            ordersContainer.innerHTML = "";
        }

        if (ordersError) {
            ordersError.hidden = true;
        }

        if (ordersEmpty) {
            ordersEmpty.hidden = false;
        }
    }


    /* =====================================================
       GET FILTERED ORDERS
    ====================================================== */

    function getFilteredOrders() {

        if (currentFilter === "all") {
            return [...orders];
        }

        return orders.filter(order => {
            return getStatus(order) === currentFilter;
        });
    }


    /* =====================================================
       SORT ORDERS
    ====================================================== */

    function sortOrders(list) {

        return list.sort((a, b) => {

            const dateA =
                new Date(a.createdAt || a.updatedAt || 0).getTime();

            const dateB =
                new Date(b.createdAt || b.updatedAt || 0).getTime();

            return dateB - dateA;
        });
    }


    /* =====================================================
       UPDATE STATISTICS
    ====================================================== */

    function updateStatistics() {

        const total = orders.length;

        const pending = orders.filter(order => {
            return getStatus(order) === "pending";
        }).length;

        const preparing = orders.filter(order => {
            return getStatus(order) === "preparing";
        }).length;

        const completed = orders.filter(order => {
            return getStatus(order) === "delivered";
        }).length;


        if (totalOrders) {
            totalOrders.textContent = total;
        }

        if (pendingOrders) {
            pendingOrders.textContent = pending;
        }

        if (preparingOrders) {
            preparingOrders.textContent = preparing;
        }

        if (completedOrders) {
            completedOrders.textContent = completed;
        }

        if (sidebarOrderCount) {
            sidebarOrderCount.textContent = total;
        }
    }


    /* =====================================================
       RENDER ORDERS
    ====================================================== */

    function renderOrders() {

        const filteredOrders =
            sortOrders(getFilteredOrders());

        if (filteredOrders.length === 0) {
            showEmpty();
            return;
        }

        if (ordersEmpty) {
            ordersEmpty.hidden = true;
        }

        if (ordersError) {
            ordersError.hidden = true;
        }


        ordersContainer.innerHTML =
            filteredOrders.map(order => {

                const status = getStatus(order);

                const customerName =
                    order.customerName ||
                    order.name ||
                    "Customer";

                const phone =
                    order.phone ||
                    "No phone";

                const itemCount =
                    getItemCount(order);

                const total =
                    order.totalAmount || 0;

                const payment =
                    formatPayment(order.paymentMethod);

                const createdAt =
                    order.createdAt ||
                    order.updatedAt;

                return `
                    <tr data-order-id="${escapeHTML(order._id)}">

                        <!-- ORDER -->

                        <td>

                            <div class="admin-order-id">

                                <strong>
                                    ${escapeHTML(getOrderId(order))}
                                </strong>

                                <small>
                                    ${escapeHTML(formatDate(createdAt))}
                                    ${escapeHTML(formatTime(createdAt))}
                                </small>

                            </div>

                        </td>


                        <!-- CUSTOMER -->

                        <td>

                            <div class="admin-customer">

                                <strong>
                                    ${escapeHTML(customerName)}
                                </strong>

                                <span>
                                    ${escapeHTML(phone)}
                                </span>

                            </div>

                        </td>


                        <!-- ITEMS -->

                        <td>

                            <span class="admin-items-count">
                                ${itemCount}
                                ${itemCount === 1 ? "item" : "items"}
                            </span>

                        </td>


                        <!-- AMOUNT -->

                        <td>

                            <strong class="admin-amount">
                                ${formatCurrency(total)}
                            </strong>

                        </td>


                        <!-- PAYMENT -->

                        <td>

                            <span class="admin-payment">

                                <i class="fa-solid ${paymentIcon(order.paymentMethod)}"></i>

                                ${escapeHTML(payment)}

                            </span>

                        </td>


                        <!-- STATUS -->

                        <td>

                            <span class="admin-status ${escapeHTML(status)}">
                                ${escapeHTML(formatStatus(status))}
                            </span>

                        </td>


                        <!-- ACTIONS -->

                        <td>

                            <div class="admin-order-actions">

                                <button
                                    type="button"
                                    class="admin-order-action"
                                    data-action="view"
                                    data-order-id="${escapeHTML(order._id)}"
                                    title="View order"
                                >
                                    <i class="fa-solid fa-eye"></i>
                                </button>


                                <button
                                    type="button"
                                    class="admin-order-action"
                                    data-action="next-status"
                                    data-order-id="${escapeHTML(order._id)}"
                                    title="Advance status"
                                >
                                    <i class="fa-solid fa-arrow-right"></i>
                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            }).join("");
    }


    /* =====================================================
       LOAD ORDERS
    ====================================================== */

    async function loadOrders() {

        showLoading();

        try {

            const response =
                await fetch(ORDERS_API, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });


            if (!response.ok) {
                throw new Error(
                    `Server returned ${response.status}`
                );
            }


            const data =
                await response.json();


            if (!Array.isArray(data)) {
                throw new Error("Invalid orders response");
            }


            orders = data;

            updateStatistics();

            renderOrders();


        } catch (error) {

            console.error(
                "Burggy admin order error:",
                error
            );

            orders = [];

            updateStatistics();

            showError();
        }
    }


    /* =====================================================
       FIND ORDER
    ====================================================== */

    function findOrder(orderId) {

        return orders.find(order => {
            return String(order._id) === String(orderId);
        });
    }


    /* =====================================================
       ORDER STATUS FLOW
    ====================================================== */

    const statusFlow = [
        "pending",
        "preparing",
        "packing",
        "out-for-delivery",
        "delivered"
    ];


    function getNextStatus(currentStatus) {

        const currentIndex =
            statusFlow.indexOf(currentStatus);

        if (currentIndex === -1) {
            return "preparing";
        }

        if (currentIndex >= statusFlow.length - 1) {
            return null;
        }

        return statusFlow[currentIndex + 1];
    }


    /* =====================================================
       UPDATE ORDER STATUS
    ====================================================== */

    async function updateOrderStatus(orderId, newStatus) {

        if (!orderId || !newStatus) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${ORDERS_API}/${encodeURIComponent(orderId)}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            status: newStatus
                        })
                    }
                );


            const data =
                await response.json()
                    .catch(() => null);


            if (!response.ok) {

                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Unable to update order"
                );
            }


            const index =
                orders.findIndex(order => {
                    return String(order._id) === String(orderId);
                });


            if (index !== -1) {

                orders[index] = {
                    ...orders[index],
                    ...(data && typeof data === "object"
                        ? data
                        : {}),
                    status: newStatus
                };
            }


            updateStatistics();

            renderOrders();

            showToast(
                `Order updated to ${formatStatus(newStatus)}`
            );


            if (orderModal?.classList.contains("active")) {
                closeModal();
            }


        } catch (error) {

            console.error(
                "Status update error:",
                error
            );

            showToast(
                error.message || "Unable to update order",
                "error"
            );
        }
    }


    /* =====================================================
       OPEN ORDER MODAL
    ====================================================== */

    function openModal(order) {

        if (!orderModal || !orderModalBody) {
            return;
        }

        const customerName =
            order.customerName ||
            order.name ||
            "Customer";

        const phone =
            order.phone ||
            "—";

        const city =
            order.city ||
            "—";

        const address =
            order.address ||
            "No address provided";

        const status =
            getStatus(order);

        const payment =
            formatPayment(order.paymentMethod);

        const items =
            Array.isArray(order.items)
                ? order.items
                : [];


        if (orderModalTitle) {
            orderModalTitle.textContent =
                `Order ${getOrderId(order)}`;
        }


        orderModalBody.innerHTML = `

            <!-- CUSTOMER DETAILS -->

            <div class="admin-modal-grid">

                <div class="admin-modal-detail">

                    <span>
                        Customer
                    </span>

                    <strong>
                        ${escapeHTML(customerName)}
                    </strong>

                </div>


                <div class="admin-modal-detail">

                    <span>
                        Phone
                    </span>

                    <strong>
                        ${escapeHTML(phone)}
                    </strong>

                </div>


                <div class="admin-modal-detail">

                    <span>
                        City
                    </span>

                    <strong>
                        ${escapeHTML(city)}
                    </strong>

                </div>


                <div class="admin-modal-detail">

                    <span>
                        Payment
                    </span>

                    <strong>
                        ${escapeHTML(payment)}
                    </strong>

                </div>

            </div>


            <!-- ADDRESS -->

            <div class="admin-modal-address">

                <span>
                    Delivery Address
                </span>

                <p>
                    ${escapeHTML(address)}
                </p>

            </div>


            <!-- STATUS -->

            <div class="admin-modal-detail" style="margin-bottom:20px;">

                <span>
                    Current Status
                </span>

                <strong>

                    <span class="admin-status ${escapeHTML(status)}">
                        ${escapeHTML(formatStatus(status))}
                    </span>

                </strong>

            </div>


            <!-- ITEMS -->

            <div class="admin-modal-items">

                ${
                    items.length
                        ? items.map(item => {

                            const itemName =
                                item.name ||
                                item.food?.name ||
                                "Food item";

                            const quantity =
                                Number(item.quantity) || 1;

                            const price =
                                Number(item.price) ||
                                Number(item.food?.price) ||
                                0;

                            const itemTotal =
                                price * quantity;

                            return `
                                <div class="admin-modal-item">

                                    <div class="admin-modal-item-info">

                                        <strong>
                                            ${escapeHTML(itemName)}
                                        </strong>

                                        <span>
                                            ${quantity} × ${formatCurrency(price)}
                                        </span>

                                    </div>

                                    <strong class="admin-modal-item-price">
                                        ${formatCurrency(itemTotal)}
                                    </strong>

                                </div>
                            `;

                        }).join("")
                        : `
                            <div class="admin-modal-item">

                                <div class="admin-modal-item-info">

                                    <strong>
                                        No item details available
                                    </strong>

                                </div>

                            </div>
                        `
                }

            </div>


            <!-- TOTAL -->

            <div class="admin-modal-total">

                <span>
                    Order Total
                </span>

                <strong>
                    ${formatCurrency(order.totalAmount)}
                </strong>

            </div>

        `;


        orderModal.classList.add("active");
        orderModal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";
    }


    /* =====================================================
       CLOSE MODAL
    ====================================================== */

    function closeModal() {

        if (!orderModal) {
            return;
        }

        orderModal.classList.remove("active");

        orderModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";
    }


    /* =====================================================
       TABLE ACTIONS
    ====================================================== */

    if (ordersContainer) {

        ordersContainer.addEventListener(
            "click",
            async event => {

                const button =
                    event.target.closest(
                        ".admin-order-action"
                    );


                if (!button) {
                    return;
                }


                const orderId =
                    button.dataset.orderId;

                const action =
                    button.dataset.action;


                if (!orderId) {
                    return;
                }


                const order =
                    findOrder(orderId);


                if (!order) {
                    showToast(
                        "Order could not be found",
                        "error"
                    );

                    return;
                }


                if (action === "view") {

                    openModal(order);

                    return;
                }


                if (action === "next-status") {

                    const currentStatus =
                        getStatus(order);

                    const nextStatus =
                        getNextStatus(currentStatus);


                    if (!nextStatus) {

                        showToast(
                            "This order is already completed"
                        );

                        return;
                    }


                    const confirmed =
                        window.confirm(
                            `Move ${getOrderId(order)} to ${formatStatus(nextStatus)}?`
                        );


                    if (!confirmed) {
                        return;
                    }


                    await updateOrderStatus(
                        orderId,
                        nextStatus
                    );
                }

            }
        );
    }


    /* =====================================================
       FILTER
    ====================================================== */

    if (orderStatusFilter) {

        orderStatusFilter.addEventListener(
            "change",
            event => {

                currentFilter =
                    event.target.value || "all";

                renderOrders();
            }
        );
    }


    /* =====================================================
       REFRESH
    ====================================================== */

    if (refreshOrders) {

        refreshOrders.addEventListener(
            "click",
            async () => {

                const icon =
                    refreshOrders.querySelector("i");

                if (icon) {
                    icon.classList.add("fa-spin");
                }

                await loadOrders();

                if (icon) {
                    icon.classList.remove("fa-spin");
                }

                showToast("Orders refreshed");
            }
        );
    }


    /* =====================================================
       RETRY
    ====================================================== */

    if (retryOrders) {

        retryOrders.addEventListener(
            "click",
            loadOrders
        );
    }


    /* =====================================================
       MODAL EVENTS
    ====================================================== */

    if (closeOrderModal) {
        closeOrderModal.addEventListener(
            "click",
            closeModal
        );
    }


    if (orderModalOverlay) {
        orderModalOverlay.addEventListener(
            "click",
            closeModal
        );
    }


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeModal();
            }

        }
    );


    /* =====================================================
       MOBILE SIDEBAR
    ====================================================== */

    if (adminMobileMenu && adminSidebar) {

        adminMobileMenu.addEventListener(
            "click",
            () => {

                adminSidebar.classList.toggle("open");

            }
        );


        document.addEventListener(
            "click",
            event => {

                if (
                    window.innerWidth > 700 ||
                    !adminSidebar.classList.contains("open")
                ) {
                    return;
                }


                const clickedInsideSidebar =
                    adminSidebar.contains(event.target);

                const clickedMenuButton =
                    adminMobileMenu.contains(event.target);


                if (
                    !clickedInsideSidebar &&
                    !clickedMenuButton
                ) {
                    adminSidebar.classList.remove("open");
                }

            }
        );
    }


    /* =====================================================
       SIDEBAR NAVIGATION
    ====================================================== */

    document
        .querySelectorAll(".admin-menu-item[data-section]")
        .forEach(item => {

            item.addEventListener(
                "click",
                event => {

                    const target =
                        item.dataset.section;

                    if (!target) {
                        return;
                    }


                    document
                        .querySelectorAll(
                            ".admin-menu-item[data-section]"
                        )
                        .forEach(menuItem => {
                            menuItem.classList.remove("active");
                        });


                    item.classList.add("active");


                    const section =
                        document.getElementById(target);


                    if (section) {

                        event.preventDefault();

                        const navbarOffset = 90;

                        const position =
                            section.getBoundingClientRect().top +
                            window.scrollY -
                            navbarOffset;

                        window.scrollTo({
                            top: position,
                            behavior: "smooth"
                        });
                    }


                    if (
                        window.innerWidth <= 700 &&
                        adminSidebar
                    ) {
                        adminSidebar.classList.remove("open");
                    }

                }
            );
        });


    /* =====================================================
       ACTIVE SECTION WHILE SCROLLING
    ====================================================== */

    const dashboardSection =
        document.getElementById("dashboard");

    const ordersSection =
        document.getElementById("orders");


    if (dashboardSection && ordersSection) {

        window.addEventListener(
            "scroll",
            () => {

                if (window.innerWidth <= 700) {
                    return;
                }


                const scrollPosition =
                    window.scrollY + 130;


                if (
                    scrollPosition >= ordersSection.offsetTop
                ) {

                    document
                        .querySelectorAll(
                            ".admin-menu-item[data-section]"
                        )
                        .forEach(item => {
                            item.classList.remove("active");
                        });


                    const ordersLink =
                        document.querySelector(
                            '.admin-menu-item[data-section="orders"]'
                        );


                    if (ordersLink) {
                        ordersLink.classList.add("active");
                    }

                } else {

                    document
                        .querySelectorAll(
                            ".admin-menu-item[data-section]"
                        )
                        .forEach(item => {
                            item.classList.remove("active");
                        });


                    const dashboardLink =
                        document.querySelector(
                            '.admin-menu-item[data-section="dashboard"]'
                        );


                    if (dashboardLink) {
                        dashboardLink.classList.add("active");
                    }
                }

            },
            { passive: true }
        );
    }


    /* =====================================================
       PROFILE BUTTON
    ====================================================== */

    const adminProfileBtn =
        document.getElementById("adminProfileBtn");


    if (adminProfileBtn) {

        adminProfileBtn.addEventListener(
            "click",
            () => {

                showToast(
                    "Burggy Admin Dashboard"
                );

            }
        );
    }


    /* =====================================================
       INITIAL LOAD
    ====================================================== */

    loadOrders();


    /* =====================================================
       EXPOSE FUNCTIONS
       Useful for debugging / future admin features
    ====================================================== */

    window.burggyAdmin = {
        loadOrders,
        updateOrderStatus,
        openModal,
        closeModal,
        getOrders: () => [...orders]
    };


    console.log(
        "🍔 Burggy Admin Dashboard loaded successfully."
    );

});