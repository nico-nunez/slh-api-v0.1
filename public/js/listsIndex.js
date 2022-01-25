const toggleShowMore = document.querySelectorAll('.show-items');


const handleToggleMoreClick = evt => {
  const btn = evt.target;
  const listBody = btn.parentElement.previousElementSibling;
  const hiddenItems = Array.from(listBody.children[0].children).slice(2);

  if(btn.classList.contains('show-more')) {
    hiddenItems.forEach(item => item.classList.remove('d-none'));
    btn.textContent = 'show less'
    btn.classList.remove('show-more');
  } else {
    hiddenItems.forEach(item => item.classList.add('d-none'));
    btn.textContent = 'show more';
    btn.classList.add('show-more');
  }
}


Array.from(toggleShowMore).forEach( moreBtn => {
  moreBtn.addEventListener('click', handleToggleMoreClick);
})