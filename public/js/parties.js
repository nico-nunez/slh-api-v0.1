(function () {
	const copyInviteLink = document.querySelector('#copy-invite-link');
	const joinDate = document.querySelector('#party-selections');
	const exchangeDate = document.querySelector('#party-exchange');
	const showSecret = document.querySelector('#party-secret-show');

	// --- PARTIES/NEW ---
	const setDateInputs = () => {
		const formatDate = (dateObj) => {
			const monthStr = String(dateObj.getMonth() + 1);
			const monthFormatted = '0'.repeat(2 - monthStr.length) + monthStr;
			const dateStr = String(dateObj.getDate());
			const dateFormatted = '0'.repeat(2 - dateStr.length) + dateStr;
			return `${dateObj.getFullYear()}-${monthFormatted}-${dateFormatted}`;
		};

		if (!joinDate.value && !exchangeDate.value) {
			const minJoin = new Date();
			minJoin.setDate(minJoin.getDate() + 1);

			const maxJoin = new Date();
			maxJoin.setFullYear(maxJoin.getFullYear() + 2);

			const minExchange = new Date(minJoin);
			minExchange.setDate(minExchange.getUTCDate() + 1);

			const maxExchange = new Date(minJoin);
			maxExchange.setFullYear(maxExchange.getFullYear() + 2);

			joinDate.value = formatDate(minJoin);
			joinDate.setAttribute('min', formatDate(minJoin));
			joinDate.setAttribute('max', formatDate(maxJoin));

			exchangeDate.value = formatDate(minExchange);
			exchangeDate.setAttribute('min', formatDate(minExchange));
			exchangeDate.setAttribute('max', formatDate(maxExchange));
		}

		const handleDateChange = (evt) => {
			const dateArr = evt.target.value.split('-');
			const dateStr = dateArr.join('/');
			const newMinExchange = new Date(dateStr);

			newMinExchange.setDate(newMinExchange.getDate() + 1);

			exchangeDate.value = formatDate(newMinExchange);
			exchangeDate.setAttribute('min', formatDate(newMinExchange));
		};

		joinDate.addEventListener('change', handleDateChange);
	};

	// --- PARTIES/SHOW ---
	const handleToggleShowSecret = (evt) => {
		const elem = evt.target;
		elem.textContent = elem.textContent === 'show' ? 'hide' : 'show';
		document.querySelector('#party-secret').classList.toggle('hidden');
	};

	// --- PARTIES/NEW ---
	if (joinDate && exchangeDate) setDateInputs();

	// --- PARTIES/SHOW ---
	if (showSecret) showSecret.addEventListener('click', handleToggleShowSecret);

	// ---PARTY INVITE LINK
	if (copyInviteLink) {
		copyInviteLink.addEventListener('click', (evt) => {
			const btn = evt.target;
			const { partyId, partySecret } = btn.dataset;
			const link = `${window.location.protocol}//${window.location.host}/parties/${partyId}?join_code=${partySecret}`;

			// COPY TO CLIPBOARD
			navigator.clipboard.writeText(link);

			// DISPLAY MESSAGE
			const copiedMessage = document.createElement('p');
			copiedMessage.textContent = 'Copied invite link to clipboard';
			copiedMessage.classList.add('alert-message');
			evt.target.parentNode.insertBefore(copiedMessage, evt.target.nextSibling);

			// REMOVE MESSAGE
			setTimeout(() => copiedMessage.remove(), 3000);
		});
	}
})();
