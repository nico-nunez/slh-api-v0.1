const emailOptions = document.querySelector('#email-options');


const handleOptionsClick = evt => {
  if (evt.target.id === 'email-verify') {
    document.querySelector('#verify').submit();
  }
  if (evt.target.id === 'email-update') {
    const emailInput = document.querySelector('#email-input')
    emailOptions.classList.remove('form-control');
    evt.target.classList.add('hidden');
    emailInput.classList.remove('email-text')
    emailInput.disabled = false;
    emailInput.focus();
  }
}

const handleVerifyClick = () => {

};

emailOptions.addEventListener('click', handleOptionsClick);