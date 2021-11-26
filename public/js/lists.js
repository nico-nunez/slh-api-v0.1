const addItemBtn = document.querySelector('.add-item');
const cancelItemBtn = document.querySelector('.cancel-item');
const editItemsContent = document.querySelector('.items-input-content');


addItemBtn.addEventListener('click', handleAddAnotherItemEvt);
cancelItemBtn.addEventListener('click', handleCancelItemEvt);


editItemsContent.addEventListener('click', handleItemEditEvt);


function handleAddAnotherItemEvt() {
    const itemInputContent = document.querySelector('.items-input-content');
    const itemBtnsDiv = document.querySelector('.item-btns');
    const numItems = itemInputContent.childElementCount;
    const newInputGroup = document.createElement('div');

    addItemBtn.classList.add('hidden')
    cancelItemBtn.classList.remove('hidden');

    newInputGroup.classList = "item-input-group";
    newInputGroup.innerHTML = `
        <label class="form-label mt-3" for="item">Name or Description</label>
        <input 
            type="text" 
            name="list[items][${numItems}][description]" 
            id="item"
            class="form-control"
            placeholder="enter description"
            required
        >
        <label class="form-label mt-3" for="link">Link</label>
        <input 
            type="text" 
            name="list[items][${numItems}][link]" 
            id="link"
            class="form-control"
            placeholder="enter link"
        >
    `
    itemInputContent.appendChild(newInputGroup);
}

function handleCancelItemEvt() {
    const itemInputContent = document.querySelector('.items-input-content');
    itemInputContent.removeChild(itemInputContent.lastChild)
    addItemBtn.classList.remove('hidden')
    cancelItemBtn.classList.add('hidden');
}

function handleItemEditEvt(evt) {
    let itemParentDiv;
    if (evt.target.tagName === 'IMG') {
        itemParentDiv = evt.target.parentElement.parentElement.parentElement
    } else {
        itemParentDiv = evt.target.parentElement.parentElement
    }
    if (evt.target.classList.contains('remove-item')) {
        itemParentDiv.remove();
    }
    
    if (evt.target.classList.contains('edit-item')) {

        for (const child of itemParentDiv.children) {
            child.classList.toggle('hidden')
        }
        itemParentDiv.classList.toggle('d-flex')
        addItemBtn.classList.add('hidden');
    }
}








