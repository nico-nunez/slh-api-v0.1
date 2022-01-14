const updateEmail = document.querySelector('.email-update');

const handleUpdateClick = (evt) => {
  evt.target.parentElement.classList.add('hidden');
  document.querySelector('.email-input').type = 'email';
  document.querySelector('.email-input').focus();
}

updateEmail.addEventListener('click', handleUpdateClick)