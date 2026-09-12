/* =========================================================
   BURGGY ADMIN
   FOOD MENU MANAGEMENT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "http://localhost:5000/api/foods";

    const foodForm = document.getElementById("foodForm");
    const foodContainer = document.getElementById("foodContainer");

    const foodName = document.getElementById("foodName");
    const foodCategory = document.getElementById("foodCategory");
    const foodPrice = document.getElementById("foodPrice");
    const foodImage = document.getElementById("foodImage");
    const foodDescription = document.getElementById("foodDescription");

    const addFoodBtn = document.getElementById("addFoodBtn");
    const refreshFoods = document.getElementById("refreshFoods");
    const retryFoods = document.getElementById("retryFoods");

    const foodLoading = document.getElementById("foodLoading");
    const foodError = document.getElementById("foodError");
    const foodEmpty = document.getElementById("foodEmpty");
    const foodTotal = document.getElementById("foodTotal");

    const adminToast = document.getElementById("adminToast");
    const adminToastMessage = document.getElementById("adminToastMessage");

    let foods = [];
    let editingFoodId = null;


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
        const price = Number(value) || 0;

        return `₹${price.toLocaleString("en-IN")}`;
    }


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

        if (image.startsWith("/uploads/")) {
            return `http://localhost:5000${image}`;
        }

        if (image.startsWith("uploads/")) {
            return `http://localhost:5000/${image}`;
        }

        return image;
    }


    function showToast(message, type = "success") {

        if (!adminToast || !adminToastMessage) {
            alert(message);
            return;
        }

        adminToastMessage.textContent = message;

        adminToast.classList.remove(
            "show",
            "success",
            "error"
        );

        adminToast.classList.add(type);

        requestAnimationFrame(() => {
            adminToast.classList.add("show");
        });

        clearTimeout(window.burggyAdminToastTimer);

        window.burggyAdminToastTimer = setTimeout(() => {
            adminToast.classList.remove("show");
        }, 3000);
    }


    function setLoading(isLoading) {

        if (foodLoading) {
            foodLoading.style.display = isLoading ? "flex" : "none";
        }

        if (foodContainer) {
            foodContainer.style.display = isLoading ? "none" : "";
        }

        if (foodEmpty) {
            foodEmpty.style.display = "none";
        }

        if (foodError) {
            foodError.style.display = "none";
        }
    }


    function showEmpty() {

        if (foodLoading) {
            foodLoading.style.display = "none";
        }

        if (foodContainer) {
            foodContainer.style.display = "none";
        }

        if (foodError) {
            foodError.style.display = "none";
        }

        if (foodEmpty) {
            foodEmpty.style.display = "flex";
        }
    }


    function showError() {

        if (foodLoading) {
            foodLoading.style.display = "none";
        }

        if (foodContainer) {
            foodContainer.style.display = "none";
        }

        if (foodEmpty) {
            foodEmpty.style.display = "none";
        }

        if (foodError) {
            foodError.style.display = "flex";
        }
    }


    function updateFoodCount() {

        if (!foodTotal) {
            return;
        }

        const count = foods.length;

        foodTotal.innerHTML = `
            <i class="fa-solid fa-layer-group"></i>
            <span>${count} ${count === 1 ? "item" : "items"}</span>
        `;
    }


    /* =====================================================
       LOAD FOODS
    ===================================================== */

    async function loadFoods() {

        setLoading(true);

        try {

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Failed to load foods");
            }

            const data = await response.json();

            foods = Array.isArray(data) ? data : [];

            updateFoodCount();

            if (foods.length === 0) {
                showEmpty();
                return;
            }

            renderFoods();

        } catch (error) {

            console.error("Food loading error:", error);

            showError();

        }
    }


    /* =====================================================
       RENDER FOODS
    ===================================================== */

    function renderFoods() {

        if (!foodContainer) {
            return;
        }

        if (!foods.length) {
            showEmpty();
            return;
        }

        foodLoading.style.display = "none";
        foodEmpty.style.display = "none";
        foodError.style.display = "none";

        foodContainer.style.display = "grid";

        foodContainer.innerHTML = foods.map(food => {

            const image = getImageURL(food.image);

            return `
                <article class="admin-food-card" data-id="${escapeHTML(food._id)}">

                    <div class="admin-food-card-image">

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(food.name)}"
                            loading="lazy"
                            onerror="this.onerror=null;this.src='images/burggylogo.png';"
                        >

                        <span class="admin-food-category">
                            ${escapeHTML(food.category || "Food")}
                        </span>

                    </div>


                    <div class="admin-food-card-content">

                        <h3>
                            ${escapeHTML(food.name)}
                        </h3>

                        <p class="admin-food-card-description">
                            ${escapeHTML(
                                food.description ||
                                "Freshly prepared and served at Burggy."
                            )}
                        </p>


                        <div class="admin-food-card-bottom">

                            <strong class="admin-food-card-price">
                                ${formatPrice(food.price)}
                            </strong>


                            <div class="admin-food-card-actions">

                                <button
                                    type="button"
                                    class="admin-food-action edit"
                                    data-action="edit"
                                    data-id="${escapeHTML(food._id)}"
                                    aria-label="Edit ${escapeHTML(food.name)}"
                                    title="Edit food"
                                >
                                    <i class="fa-solid fa-pen"></i>
                                </button>


                                <button
                                    type="button"
                                    class="admin-food-action delete"
                                    data-action="delete"
                                    data-id="${escapeHTML(food._id)}"
                                    aria-label="Delete ${escapeHTML(food.name)}"
                                    title="Delete food"
                                >
                                    <i class="fa-solid fa-trash"></i>
                                </button>

                            </div>

                        </div>

                    </div>

                </article>
            `;

        }).join("");

    }


    /* =====================================================
       ADD / UPDATE FOOD
    ===================================================== */

    async function saveFood(event) {

        event.preventDefault();

        if (!foodName || !foodCategory || !foodPrice) {
            return;
        }

        const name = foodName.value.trim();
        const category = foodCategory.value.trim();
        const price = Number(foodPrice.value);
        const description = foodDescription
            ? foodDescription.value.trim()
            : "";

        const imageFile = foodImage && foodImage.files
            ? foodImage.files[0]
            : null;


        /* ---------------------------------------------
           VALIDATION
        --------------------------------------------- */

        if (!name) {
            showToast("Please enter the food name.", "error");
            foodName.focus();
            return;
        }

        if (!category) {
            showToast("Please select a category.", "error");
            foodCategory.focus();
            return;
        }

        if (!Number.isFinite(price) || price <= 0) {
            showToast("Please enter a valid price.", "error");
            foodPrice.focus();
            return;
        }


        /* ---------------------------------------------
           UPDATE EXISTING FOOD
        --------------------------------------------- */

        if (editingFoodId) {

            await updateFood(
                editingFoodId,
                {
                    name,
                    category,
                    description,
                    price
                }
            );

            return;
        }


        /* ---------------------------------------------
           ADD NEW FOOD
        --------------------------------------------- */

        try {

            setFormLoading(true);

            const formData = new FormData();

            formData.append("name", name);
            formData.append("category", category);
            formData.append("description", description);
            formData.append("price", price);

            if (imageFile) {
                formData.append("image", imageFile);
            }


            const response = await fetch(`${API_URL}/add`, {
                method: "POST",
                body: formData
            });


            const data = await response.json().catch(() => ({}));


            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to add food"
                );
            }


            showToast(
                data.message || "Food added successfully 🍔",
                "success"
            );


            resetFoodForm();

            await loadFoods();

        } catch (error) {

            console.error("Add food error:", error);

            showToast(
                error.message || "Unable to add food.",
                "error"
            );

        } finally {

            setFormLoading(false);

        }

    }


    /* =====================================================
       UPDATE FOOD
    ===================================================== */

    async function updateFood(foodId, foodData) {

        try {

            setFormLoading(true);


            const response = await fetch(
                `${API_URL}/${foodId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(foodData)
                }
            );


            const data = await response.json().catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to update food"
                );

            }


            showToast(
                "Food updated successfully.",
                "success"
            );


            resetFoodForm();

            await loadFoods();

        } catch (error) {

            console.error("Update food error:", error);

            showToast(
                error.message || "Unable to update food.",
                "error"
            );

        } finally {

            setFormLoading(false);

        }

    }


    /* =====================================================
       EDIT FOOD
    ===================================================== */

    function editFood(foodId) {

        const food = foods.find(
            item => String(item._id) === String(foodId)
        );

        if (!food) {
            showToast("Food item not found.", "error");
            return;
        }


        editingFoodId = foodId;


        if (foodName) {
            foodName.value = food.name || "";
        }

        if (foodCategory) {
            foodCategory.value = food.category || "";
        }

        if (foodPrice) {
            foodPrice.value = food.price ?? "";
        }

        if (foodDescription) {
            foodDescription.value = food.description || "";
        }


        if (addFoodBtn) {

            addFoodBtn.innerHTML = `
                <i class="fa-solid fa-check"></i>
                Update Food
            `;

        }


        const formCard = document.querySelector(
            ".admin-food-form-card"
        );

        if (formCard) {

            formCard.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


        updateFormHeading();

        showToast(
            `Editing "${food.name}"`,
            "success"
        );

    }


    /* =====================================================
       DELETE FOOD
    ===================================================== */

    async function deleteFood(foodId) {

        const food = foods.find(
            item => String(item._id) === String(foodId)
        );

        if (!food) {
            showToast("Food item not found.", "error");
            return;
        }


        const confirmed = window.confirm(
            `Delete "${food.name}" from the menu?\n\nThis action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }


        try {

            const response = await fetch(
                `${API_URL}/${foodId}`,
                {
                    method: "DELETE"
                }
            );


            const data = await response.json().catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to delete food"
                );

            }


            showToast(
                data.message || "Food removed successfully.",
                "success"
            );


            if (editingFoodId === foodId) {
                resetFoodForm();
            }


            await loadFoods();

        } catch (error) {

            console.error("Delete food error:", error);

            showToast(
                error.message || "Unable to delete food.",
                "error"
            );

        }

    }


    /* =====================================================
       FORM STATE
    ===================================================== */

    function setFormLoading(isLoading) {

        if (!addFoodBtn) {
            return;
        }

        addFoodBtn.disabled = isLoading;


        if (isLoading) {

            addFoodBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                ${editingFoodId ? "Updating..." : "Adding..."}
            `;

        } else {

            addFoodBtn.innerHTML = editingFoodId
                ? `
                    <i class="fa-solid fa-check"></i>
                    Update Food
                `
                : `
                    <i class="fa-solid fa-plus"></i>
                    Add Food
                `;

        }

    }


    function resetFoodForm() {

        editingFoodId = null;

        if (foodForm) {
            foodForm.reset();
        }

        if (addFoodBtn) {

            addFoodBtn.innerHTML = `
                <i class="fa-solid fa-plus"></i>
                Add Food
            `;

            addFoodBtn.disabled = false;

        }

        updateFormHeading();

        updateFileLabel();

    }


    function updateFormHeading() {

        const heading = document.querySelector(
            ".admin-food-form-intro strong"
        );

        const description = document.querySelector(
            ".admin-food-form-intro span"
        );


        if (editingFoodId) {

            if (heading) {
                heading.textContent = "Edit menu item";
            }

            if (description) {
                description.textContent =
                    "Update the details of this Burggy menu item.";
            }

        } else {

            if (heading) {
                heading.textContent = "Add a new menu item";
            }

            if (description) {
                description.textContent =
                    "Add a food item to your Burggy menu.";
            }

        }

    }


    /* =====================================================
       FILE NAME
    ===================================================== */

    function updateFileLabel() {

        if (!foodImage) {
            return;
        }

        const fileLabel = document.querySelector(
            ".admin-food-file-label"
        );

        if (!fileLabel) {
            return;
        }

        const strong = fileLabel.querySelector(
            ".admin-food-file-text strong"
        );

        if (!strong) {
            return;
        }


        if (foodImage.files && foodImage.files.length > 0) {

            strong.textContent =
                foodImage.files[0].name;

        } else {

            strong.textContent =
                "Choose food image";

        }

    }


    /* =====================================================
       EVENT DELEGATION
    ===================================================== */

    if (foodContainer) {

        foodContainer.addEventListener(
            "click",
            event => {

                const button = event.target.closest(
                    "[data-action]"
                );

                if (!button) {
                    return;
                }

                const action = button.dataset.action;
                const foodId = button.dataset.id;

                if (!foodId) {
                    return;
                }


                if (action === "edit") {
                    editFood(foodId);
                }


                if (action === "delete") {
                    deleteFood(foodId);
                }

            }
        );

    }


    /* =====================================================
       EVENTS
    ===================================================== */

    if (foodForm) {
        foodForm.addEventListener(
            "submit",
            saveFood
        );
    }


    if (refreshFoods) {

        refreshFoods.addEventListener(
            "click",
            () => {

                refreshFoods.disabled = true;

                loadFoods().finally(() => {
                    refreshFoods.disabled = false;
                });

            }
        );

    }


    if (retryFoods) {

        retryFoods.addEventListener(
            "click",
            loadFoods
        );

    }


    if (foodImage) {

        foodImage.addEventListener(
            "change",
            updateFileLabel
        );

    }


    /* =====================================================
       PRICE INPUT
    ===================================================== */

    if (foodPrice) {

        foodPrice.addEventListener(
            "input",
            () => {

                foodPrice.value =
                    foodPrice.value.replace(
                        /[^0-9]/g,
                        ""
                    );

            }
        );

    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                editingFoodId
            ) {

                resetFoodForm();

                showToast(
                    "Edit cancelled.",
                    "success"
                );

            }

        }
    );


    /* =====================================================
       GLOBAL FUNCTIONS
       Useful if other admin code needs them.
    ===================================================== */

    window.loadFoods = loadFoods;
    window.editFood = editFood;
    window.deleteFood = deleteFood;

    window.burggyAdminFood = {
        loadFoods,
        editFood,
        deleteFood,
        resetFoodForm
    };


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadFoods();

});