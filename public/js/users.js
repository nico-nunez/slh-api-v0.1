(function() {
  const emailUpdate = document.querySelector('#email-update');
  const emailVerify = document.querySelector('#email-verify');
  const avatars = document.querySelectorAll('.avatar-label');
  const form = document.querySelector('.validate-form');

  const handleOptionsClick = evt => {
    if (evt.target.id === 'email-verify') {
      document.querySelector('#verify').submit();
    }
    if (evt.target.id === 'email-update') {
      const emailInput = document.querySelector('#email-input')
      document.querySelector('.email-text').classList.add('d-none');
      // evt.target.parentElement.classList.remove('form-control');
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

  emailUpdate.addEventListener('click', handleOptionsClick);

  if(emailVerify) {
    emailVerify.addEventListener('click', handleOptionsClick);
  }

  Array.from(avatars).forEach(avatar => {
    avatar.addEventListener('click', handleAvatarClick)
  });


})();