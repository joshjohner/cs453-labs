const API_BASE_URL = "http://localhost:3000";

const loadButton = document.querySelector("#load-items");
const itemList = document.querySelector("#items");
const addItemForm = document.querySelector("#add-item-form");
const itemNameInput = document.querySelector("#item-name");
const itemQuantityInput = document.querySelector("#item-quantity");
const itemCategoryInput = document.querySelector("#item-category");
const statusBox = document.querySelector("#status");
const editModal = document.querySelector("#edit-modal");
const closeModalButton = document.querySelector("#close-modal");
const editItemForm = document.querySelector("#edit-item-form");
const editNameBox = document.querySelector("#edit-item-name");
const editQuantityBox = document.querySelector("#edit-item-quantity");
const editCategoryBox = document.querySelector("#edit-item-category");


window.addEventListener("DOMContentLoaded", () => {
  loadCategories(itemCategoryInput);
});


function setStatus(message) {
  statusBox.textContent = message;
}

function renderItems(items) {
  itemList.replaceChildren();

  for (const item of items) {
    const li = renderItem(item);
    itemList.appendChild(li);
  }
}

function renderItem(item) {

  const li = document.createElement("li");
  li.textContent = `  ${item.id}: [ ${item.category_name} ] ${item.name} (${item.quantity})`;
  
  // --- Edit Button ---
  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", async () => {
    await openEditModal(item);
  });

  // --- Delete Button ---
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/items/${item.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });


      if (!response.ok) {
        throw new Error(data.message ?? `DELETE /api/items/${item.id} failed with status ${response.status}`);
      }

      setStatus(`Deleted item: ${item.id}`);
      await loadItems();
    } catch (error) {
      setStatus(error.message);
    }
  });

  const btnContainer = document.createElement("div");
  btnContainer.classList.add("li-btn-container");
  btnContainer.appendChild(editButton);
  btnContainer.appendChild(deleteButton);
  li.appendChild(btnContainer);

  return li;
}

async function loadItems() {
  setStatus("Loading items...");

  try {
    const response = await fetch(`${API_BASE_URL}/api/items`);

    if (!response.ok) {
      throw new Error(`GET /api/items failed with status ${response.status}`);
    }

    const data = await response.json();
    renderItems(data.items);
    setStatus("Items loaded.");
  } catch (error) {
    setStatus(error.message);
  }
}

async function addItem(name, quantity, category_id) {
  setStatus("Adding item...");

  try {
    const response = await fetch(`${API_BASE_URL}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, quantity, category_id })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? `POST /api/items failed with status ${response.status}`);
    }

    setStatus(`Added item: ${data.item.name}`);
    await loadItems();
  } catch (error) {
    setStatus(error.message);
  }
}


addItemForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const name = itemNameInput.value.trim();
  const quantity = Number(itemQuantityInput.value);
  const category_id = Number(itemCategoryInput.value);
  
  if (!name || !Number.isInteger(quantity) || quantity < 0 || isNaN(category_id)) {
    setStatus("Enter a name, a non-negative integer quantity, and a valid category.");
    return;
  }
  
  itemNameInput.value = "";
  itemQuantityInput.value = "0";
  itemCategoryInput.value = "";
  await addItem(name, quantity, category_id);
});

async function openEditModal(item) {

  editNameBox.value = item.name;
  editQuantityBox.value = item.quantity;
  editCategoryBox.value = item.category_id;
  editModal.dataset.nameIsChanged = "false";
  editModal.dataset.quantityIsChanged = "false";
  editModal.dataset.categoryIsChanged = "false";
  editModal.dataset.item = JSON.stringify(item);
  await loadCategories(editCategoryBox);
  editCategoryBox.value = item.category_id;
  editModal.classList.remove("hidden");
}

async function loadCategories(categoryBox) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    if (!response.ok) {
      throw new Error(`Failed to load categories with status ${response.status}`);
    }
    const data = await response.json();
    categoryBox.replaceChildren();
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- Select a category --";
    categoryBox.appendChild(defaultOption);
    for (const category of data.categories) {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categoryBox.appendChild(option);
    }
  } catch (error) {
    console.error("Failed to load categories:", error);
  }
}

loadButton.addEventListener("click", loadItems);

editItemForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const originalItem = JSON.parse(editModal.dataset.item);
  let updatedItem = { ...originalItem };

  const itemId = originalItem.id;
  
  
  const statusBox = document.getElementById("edit-status");

  const nameIsChanged = editModal.dataset.nameIsChanged === "true";
  const quantityIsChanged = editModal.dataset.quantityIsChanged === "true";
  const categoryIsChanged = editModal.dataset.categoryIsChanged === "true";

  if (!nameIsChanged && !quantityIsChanged && !categoryIsChanged) {
    statusBox.textContent = "No changes to save.";
    return;
  }
  
  if (nameIsChanged) {
    console.log("Name changed to", editNameBox.value);
    updatedItem.name = editNameBox.value.trim();
    if (!updatedItem.name) {
      statusBox.textContent = "Name cannot be empty.";
      editNameBox.value = originalItem.name;
      return;
    }
  }

  if (quantityIsChanged) {
    console.log("Quantity changed to", editQuantityBox.value);
    updatedItem.quantity = Number(editQuantityBox.value);
    if (isNaN(updatedItem.quantity) || updatedItem.quantity < 0) {
      statusBox.textContent = "Quantity must be a non-negative integer.";
      editQuantityBox.value = originalItem.quantity;
      return;
    }
  }

  if (categoryIsChanged) {
    console.log("Category changed to", editCategoryBox.value);
    updatedItem.category_id = Number(editCategoryBox.value);
    if (isNaN(updatedItem.category_id)) {
      statusBox.textContent = "Please select a valid category.";
      editCategoryBox.value = originalItem.category_id;
      return;
    }
  }

  if (nameIsChanged && quantityIsChanged && categoryIsChanged) {
    statusBox.textContent = "Saving changes...";

    try {
      const url = `${API_BASE_URL}/api/items/${itemId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: updatedItem.name, quantity: updatedItem.quantity, category_id: updatedItem.category_id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? `PUT /api/items/${itemId} failed with status ${response.status}`);
      }

      setStatus(`Updated item: ${data.item.name}`);
      await loadItems();
    } catch (error) {
      setStatus(error.message);
    }

  } else {
    statusBox.textContent = nameIsChanged ? "Saving name change..." : quantityIsChanged ? "Saving quantity change..." : "Saving category change...";
    console.log("Saving partial update with", nameIsChanged ? { name: updatedItem.name } : quantityIsChanged ? { quantity: updatedItem.quantity } : { category_id: updatedItem.category_id });
    try {
      const url = `${API_BASE_URL}/api/items/${itemId}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(nameIsChanged ? { name: updatedItem.name } : quantityIsChanged ? { quantity: updatedItem.quantity } : { category_id: updatedItem.category_id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? `PATCH /api/items/${itemId} failed with status ${response.status}`);
      }

      setStatus(`Updated item: ${data.item.name}`);
      await loadItems();
    } catch (error) {
      setStatus(error.message);
    }
  }

  editModal.classList.add("hidden");
});

editNameBox.addEventListener("input", () => {
  console.log("Name input changed");
  editModal.dataset.nameIsChanged = "true";
});

editQuantityBox.addEventListener("input", () => {
  console.log("Quantity input changed");
  editModal.dataset.quantityIsChanged = "true";
});

editCategoryBox.addEventListener("change", () => {
  console.log("Category select changed");
  editModal.dataset.categoryIsChanged = "true";
});

closeModalButton.addEventListener("click", () => {
  editModal.classList.add("hidden");
});

