(function() {
  const emailUpdate = document.querySelector('#email-update');
  const emailVerify = document.querySelector('#email-verify');
  const avatars = document.querySelectorAll('.avatar-label');
  const deleteBtn = document.querySelector('#btn-delete');

  const handleOptionsClick = evt => {
    if (evt.target.id === 'email-verify') {
      document.querySelector('#verify').submit();
    }
    if (evt.target.id === 'email-update') {
      const emailInput = document.querySelector('#email-input')
      document.querySelector('.email-text').classList.add('d-none');
      evt.target.classList.add('d-none');
      emailInput.type = 'text';
      emailInput.focus();
    }
  }

  const handleAvatarClick = evt => {
    evt.stopPropagation();
    let srcValue;
    if (evt.target.classList.contains('avatar-label')) {
      srcValue = evt.target.previousElementSibling.value;    
    }
    if (evt.target.classList.contains('avatar-label-img')) {
      srcValue = evt.target.parentElement.previousElementSibling.value;
    }
    document.querySelector('.avatar-profile').src = srcValue
  }

  const handleDeleteProfileClick = () => {
    const input = document.querySelector('#confirm-delete');
    const form = document.querySelector('#delete-user');
    if (input.value !== 'delete me') {
      input.style.border = '2px solid red';
      return;
    }
    form.submit();
  }

  emailUpdate.addEventListener('click', handleOptionsClick);
  deleteBtn.addEventListener('click', handleDeleteProfileClick);

  if(emailVerify) {
    emailVerify.addEventListener('click', handleOptionsClick);
  }

  Array.from(avatars).forEach(avatar => {
    avatar.addEventListener('click', handleAvatarClick)
  });


})();