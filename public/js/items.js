const addItemBtn = document.querySelector('.add-additional-item');

addItemBtn.addEventListener('click', handleAddAnotherItemEvt)


function handleAddAnotherItemEvt() {
    const itemInputContent = document.querySelector('.item-input-content');
    const numItems = itemInputContent.childElementCount;
    const newInputGroup = document.createElement('div');
    newInputGroup.classList = "item-input-group";

    newInputGroup.innerHTML = `
        <label class="form-label mt-3" for="item">Name or Description</label>
        <input 
            type="text" 
            name="list[items][${numItems}][description]" 
            id="item"
            class="form-control"
            placeholder="enter description"
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




