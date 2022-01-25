(function () {
	const addItemBtn = document.querySelector(".add-item");
	const cancelItemBtn = document.querySelector(".cancel-item");
  const addedItems = document.querySelector('#list-items-added');


  // Create added item description div
  const itemDescDiv = (itemDesc, itemLink) => {
    const descDiv = document.createElement('div');
    descDiv.classList = 'w-75';
    let description;
    if (itemLink) {
      description = document.createElement('a');
      description.href = itemLink;
      description.target = '_blank'
      description.textContent = itemDesc;
    } else {
      description = document.createElement('p');
      description.textContent = itemDesc;
    }
    description.classList = 'mb-0 text-ellipsis';
    descDiv.appendChild(description);

    return descDiv;
  }


  // Create edit/delete icons for added item
  const itemIconsDiv = () => {
    const iconsDiv = document.createElement('div');
    iconsDiv.classList.add('item-icons');
    const iconEdit = document.createElement('i');
    const iconDelete = document.createElement('i');

    iconEdit.classList = 'fas fa-pen pe-2 pointer';
    iconEdit.id = 'item-edit'
    iconDelete.classList = 'fas fa-trash-alt pointer';
    iconDelete.id = 'item-delete'

    iconsDiv.appendChild(iconEdit);
    iconsDiv.appendChild(iconDelete);

    return iconsDiv;
  }


  // Create div container to to display added item
  const showItemDiv = (desc, link) => {
    const showItemDiv = document.createElement('div');
    showItemDiv.classList = 'd-flex justify-content-between';

    showItemDiv.appendChild(itemDescDiv(desc, link));
    showItemDiv.appendChild(itemIconsDiv());

    return showItemDiv;
  }


  // Create new list-item:
  // - display added item
  // - clone and hide original input group and values
  const createNewItemGroup = inputGroup => {
    const inputClone = inputGroup.cloneNode(true);

    const itemDesc = inputClone.childNodes[3].value;
    const itemLink = inputClone.childNodes[7].value;

    inputClone.classList = 'd-none mt-2';

    const newItem = document.createElement('div');
    newItem.classList.add('list-item');
    newItem.appendChild(showItemDiv(itemDesc, itemLink));
    newItem.appendChild(inputClone);

    return newItem;
  }

  // Add new list-item
  const handleAddItemClick = () => {
    const inputGroup = document.querySelector('.item-input-group');
    const displayAddedItems = document.querySelector('#list-items-added');
    const numItems = displayAddedItems.childElementCount;
    const descInput = inputGroup.childNodes[3];
    const linkInput = inputGroup.childNodes[7];

    if(!descInput.value) {
      descInput.classList.add('border', 'border-danger', 'border-2');
      return;
    }
    document.querySelector('#list-items-none').classList.add('d-none');
    
    const listItem = createNewItemGroup(inputGroup);
    displayAddedItems.appendChild(listItem);
    
    // Reset input values
    descInput.value = '';
    descInput.name = `list[items][${numItems}][description]`
    descInput.required = false;
    descInput.classList.remove('border-danger');
    linkInput.value = '';
    linkInput.name = `list[items][${numItems}][link]`
  }

    // Update Item Buttons
    const updateItemBtns = () => {
      const btnContainer = document.createElement('div');
      const updateBtn = document.createElement('button');
      const cancelBtn = document.createElement('button');
      updateBtn.classList = 'btn btn-secondary me-2';
      updateBtn.type = 'button'
      updateBtn.textContent = 'Update'
      updateBtn.id = 'btn-update';
      cancelBtn.id = 'btn-cancel'
      cancelBtn.classList = 'btn btn-warning';
      cancelBtn.type = 'button'
      cancelBtn.textContent = 'Cancel'
      btnContainer.appendChild(updateBtn);
      btnContainer.appendChild(cancelBtn);
      btnContainer.classList.add('p-3','border-bottom', 'border-secondary')
  
      return btnContainer;
    }

  const showItemInputs = target => {
    const itemDisplay = target.parentElement.parentElement;
    const itemInputs = itemDisplay.nextElementSibling;
    const itemDesc = itemInputs.childNodes[3].value;
    const itemLink = itemInputs.childNodes[7].value;
    
    itemInputs.classList.remove('d-none');
    itemInputs.appendChild(updateItemBtns());

    return {itemDesc, itemLink};
  }

  const originalItemVals = {
    description: '',
    link: ''
  }
  const cancelItemUpdate = (target, originalItemVals) => {
    const btnContainer = target.parentElement;
    const inputGroup = btnContainer.parentElement;
    inputGroup.childNodes[3].value = originalItemVals.description;
    inputGroup.childNodes[7].value = originalItemVals.link;
    btnContainer.remove();
    inputGroup.classList.add('d-none');
    originalItemVals.description = '';
    originalItemVals.link = '';
  }
  const updateItem = target => {
    const btnContainer = target.parentElement;
    const inputGroup = btnContainer.parentElement;
    const displayItem = inputGroup.previousElementSibling;
    const inputDesc = inputGroup.childNodes[3];
    const inputLink = inputGroup.childNodes[7];
    const displayItemDesc = displayItem.children[0].children[0];

    if (!inputDesc.value) {
      inputDesc.classList.add('border', 'border-danger', 'border-2');
      return;
    }
    if (!originalItemVals.link && inputLink.value) {
      const link = document.createElement('a');
      link.href = inputLink.value;
      link.target = '_blank';
      link.classList.add('mb-0', 'text-ellipsis');
      link.textContent = inputDesc.value;
      displayItem.children[0].replaceChild(link, displayItemDesc);
    } else {
      displayItemDesc.textContent = inputDesc.value;
    }
    inputDesc.classList.remove('border-danger');
    btnContainer.remove();
    inputGroup.classList.add('d-none');
    originalItemVals.description = '';
    originalItemVals.link = '';
  }

  const handleAddedItemsClick = evt => {
    const inputGroup = document.querySelector('.item-input-group');
    const target = evt.target
    if (target.id === 'item-edit') {
      if(originalItemVals.description) return;
      const {itemDesc, itemLink} = showItemInputs(target);
      originalItemVals.description = itemDesc;
      originalItemVals.link = itemLink;
    }
    if (target.id === 'item-delete') {
      const listItem = target.parentElement.parentElement.parentElement;
      listItem.remove();
    }
    if (target.id === 'btn-update') {
      updateItem(target);
    }
    if (target.id === 'btn-cancel') {
      cancelItemUpdate(target, originalItemVals);
    }


  }


	addItemBtn.addEventListener("click", handleAddItemClick);
	cancelItemBtn.addEventListener("click", handleCancelItemEvt);
	addedItems.addEventListener('click', handleAddedItemsClick);


	function handleCancelItemEvt() {
		const itemInputContent = document.querySelector(".items-input-content");
		itemInputContent.removeChild(itemInputContent.lastChild);
		addItemBtn.classList.remove("hidden");
		cancelItemBtn.classList.add("hidden");
	}
})();
