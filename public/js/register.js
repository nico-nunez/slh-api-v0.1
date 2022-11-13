(function () {
	const password = document.querySelector('#password');
	const confirmPass = document.querySelector('#confirmPass');

	const validateMatchingPasswords = (evt) => {
		const errorMessage = document.querySelectorAll('.alert-message');

		if (confirmPass.value !== password.value) {
			if (!errorMessage.length) {
				const alertMsg = document.createElement('p');
				alertMsg.textContent = 'Passwords must match';
				alertMsg.classList.add('alert-message');
				confirmPass.parentNode.insertBefore(
					alertMsg,
					confirmPass.previousSibling
				);
			}
		} else {
			errorMessage.forEach((msg) => msg.remove());
		}
	};

	password.addEventListener('input', validateMatchingPasswords);
	confirmPass.addEventListener('input', validateMatchingPasswords);

	if (!passwordsMatch) {
		const alertMessage = document.createElement('p');
		alertMessage.textContent = 'Passwords must match.';
		alertMessage.classList.add('alert-message');
		confirmPass.parentNode.insertBefore(
			alertMessage,
			confirmPass.previousSibling
		);
	}
})();
