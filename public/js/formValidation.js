(function () {
  'use strict';

  const forms = document.querySelectorAll('.validate-form');
  for(let form of forms) {
    form.addEventListener('submit', (event) => {
      if(!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  }
})();