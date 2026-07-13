const API_BASE_URL = "http://localhost:3000";

const loadButton = document.querySelector("#load-items");
const itemList = document.querySelector("#items");
const form = document.querySelector("#add-item-form");
const itemNameInput = document.querySelector("#item-name");
const itemQuantityInput = document.querySelector("#item-quantity");
const statusBox = document.querySelector("#status");
const editModal = document.querySelector("#edit-modal");
const closeModalButton = document.querySelector("#close-modal");
const editItemForm = document.querySelector("#edit-item-form");
const editNameBox = document.querySelector("#edit-item-name");
const editQuantityBox = document.querySelector("#edit-item-quantity");




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
  li.textContent = `${item.id}: ${item.name} (${item.quantity})`;
  
  // --- Edit Button ---
  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    openEditModal(item);
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

async function addItem(name, quantity) {
  setStatus("Adding item...");

  try {
    const response = await fetch(`${API_BASE_URL}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, quantity })
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

loadButton.addEventListener("click", loadItems);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = itemNameInput.value.trim();
  const quantity = Number(itemQuantityInput.value);

  if (!name || !Number.isInteger(quantity) || quantity < 0) {
    setStatus("Enter a name and a non-negative integer quantity.");
    return;
  }

  itemNameInput.value = "";
  itemQuantityInput.value = "0";
  await addItem(name, quantity);
});

function openEditModal(item) {

  editNameBox.value = item.name;
  editQuantityBox.value = item.quantity;

  editModal.dataset.nameIsChanged = "false";
  editModal.dataset.quantityIsChanged = "false";
  editModal.dataset.item = JSON.stringify(item);
  editModal.classList.remove("hidden");
}


editItemForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const originalItem = JSON.parse(editModal.dataset.item);
  let updatedItem = { ...originalItem };

  const itemId = originalItem.id;
  
  
  const statusBox = document.getElementById("edit-status");

  const nameIsChanged = editModal.dataset.nameIsChanged === "true";
  const quantityIsChanged = editModal.dataset.quantityIsChanged === "true";

  if (!nameIsChanged && !quantityIsChanged) {
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

  if (nameIsChanged && quantityIsChanged) {
    statusBox.textContent = "Saving changes...";

    try {
      const url = `${API_BASE_URL}/api/items/${itemId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: updatedItem.name, quantity: updatedItem.quantity })
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
    statusBox.textContent = nameIsChanged ? "Saving name change..." : "Saving quantity change...";
    console.log("Saving partial update with", nameIsChanged ? { name: updatedItem.name } : { quantity: updatedItem.quantity });
    try {
      const url = `${API_BASE_URL}/api/items/${itemId}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(nameIsChanged ? { name: updatedItem.name } : { quantity: updatedItem.quantity })
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

closeModalButton.addEventListener("click", () => {
  editModal.classList.add("hidden");
});
