// Get the elements
const materialForm = document.getElementById('material-form');
const workOrderNumberInput = document.getElementById('work-order-number');
const itemNumberInput = document.getElementById('item-number-0');
const itemQuantityInput = document.getElementById('item-quantity-0');
const itemDescriptionInput = document.getElementById('item-description-0');
const addItemBtn = document.getElementById('add-item-btn');
const itemList = document.getElementById('item-list');
const recordMaterialsBtn = document.getElementById('record-materials-btn');
const mainContainer = document.getElementById('main-container');

// Initialize variables
let currentItemIndex = 0;

// Function to create a new item
function createItem() {
  const item = document.createElement('div');
  item.innerHTML = `
    <label>Item Number:</label>
    <input type="text" id="item-number-${currentItemIndex}" placeholder="Enter item number">
    <label>Quantity:</label>
    <input type="number" id="item-quantity-${currentItemIndex}" placeholder="Enter quantity">
    <label>Item Description:</label>
    <input type="text" id="item-description-${currentItemIndex}" placeholder="Enter item description">
    <button class="delete-btn">Delete</button>
  `;
  return item;
}

// Add event listener to the add item button
addItemBtn.addEventListener('click', () => {
  const item = createItem();
  itemList.appendChild(item);
  currentItemIndex++;
});

// Add event listener to the item list
itemList.addEventListener('click', (event) => {
  if (event.target.classList.contains('delete-btn')) {
    const item = event.target.parentNode;
    itemList.removeChild(item);
    currentItemIndex--;
  }
});

// Add event listener to the record materials button
// Add event listener to the record materials button
recordMaterialsBtn.addEventListener('click', (event) => {
  event.preventDefault();
  const workOrderNumber = workOrderNumberInput.value;
  const items = itemList.children;

  // Get the recorded materials from the data.json file
  fetch('https://raw.githubusercontent.com/your-username/your-repo-name/master/data.json')
    .then(response => response.json())
    .then(data => {
      let recordedMaterials = data.recordedItems || [];

      // Iterate over the items and add them to the recordedMaterials array
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemNumberInput = item.querySelector(`#item-number-${i}`);
        const quantityInput = item.querySelector(`#item-quantity-${i}`);
        const descriptionInput = item.querySelector(`#item-description-${i}`);
        const itemNumber = itemNumberInput.value;
        const quantity = quantityInput.value;
        const description = descriptionInput.value;

        // Check if the item already exists in the recordedMaterials array
        const existingItemIndex = recordedMaterials.findIndex(material => material.workOrderNumber === workOrderNumber && material.itemNumber === itemNumber);

        if (existingItemIndex === -1) {
          // Add the new item to the recordedMaterials array
          recordedMaterials.push({
            workOrderNumber: workOrderNumber,
            itemNumber: itemNumber,
            quantity: quantity,
            description: description,
            date: new Date().toLocaleDateString()
          });
        }
      }

      // Save the recorded materials to the data.json file
      const jsonData = JSON.stringify({ recordedItems: recordedMaterials });
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create a new GitHub issue to store the data
      const issueTitle = `Recorded Materials - ${new Date().toLocaleDateString()}`;
      const issueBody = `Recorded materials for work order ${workOrderNumber}: ${JSON.stringify(recordedMaterials)}`;
      const issueLabels = ['recorded-materials'];

      // Use the GitHub API to create a new issue
      fetch(`https://api.github.com/repos/your-username/your-repo-name/issues`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer your-github-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: issueLabels
        })
      })
      .then(response => response.json())
      .then(data => console.log(data));

      // Clear the input fields and reset the list of items
      workOrderNumberInput.value = '';
      itemList.innerHTML = '';
      currentItemIndex = 0;

      // Display the recorded materials
      displayRecordedMaterials();
    });
});
 // Add event listener to the main container
 mainContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
      const index = event.target.dataset.index;
      const recordedMaterials = JSON.parse(localStorage.getItem('recordedMaterials'));
      recordedMaterials.splice(index, 1);
      localStorage.setItem('recordedMaterials', JSON.stringify(recordedMaterials));
      displayRecordedMaterials();
    }
  });

// Function to display the recorded materials
function displayRecordedMaterials() {
    mainContainer.innerHTML = ''; // Clear the main container
    const recordedMaterials = JSON.parse(localStorage.getItem('recordedMaterials')) || [];
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    // Create the table header
    const headerRow = document.createElement('tr');
    const headers = ['Work Order Number', 'Item Number', 'Quantity', 'Description', 'Date'];
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    
    // Create the table body
    recordedMaterials.forEach((material, index) => {
      const row = document.createElement('tr');
      const cells = [
        material.workOrderNumber,
        material.itemNumber,
        material.quantity,
        material.description,
        material.date
      ];
      cells.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        row.appendChild(td);
      });
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.classList.add('delete-btn');
      deleteBtn.dataset.index = index;
      row.appendChild(deleteBtn);
      tbody.appendChild(row);
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    mainContainer.appendChild(table);
  }
