const updateEmail = document.querySelector('.email-update');
const confirmEmail = document.querySelector('.email-confirm');


const handleUpdateClick = evt => {
  evt.target.parentElement.classList.add('hidden');
  document.querySelector('.email-input').type = 'email';
  document.querySelector('.email-input').focus();
}

const handleConfirmClick = () => {
  document.querySelector('#confirm').submit();
};

if(updateEmail)
  updateEmail.addEventListener('click', handleUpdateClick);

if(confirmEmail)
  confirmEmail.addEventListener('click', handleConfirmClick);