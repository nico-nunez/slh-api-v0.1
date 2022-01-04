(function () {
	let countdown;
	clearInterval(countdown);
	const currentYear = new Date().getFullYear();
	const xmasDate = new Date(`Dec 25, ${currentYear} 00:00:00`);

	if (xmasDate.getTime() < Date.now()) 
    xmasDate.setFullYear(currentYear + 1);

  const updateCounter = () => {
		const timeDiff =  xmasDate.getTime() - Date.now();

		const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
		const hours = Math.floor(
			(timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
		);
		const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

		document.getElementById("countdown-clock").textContent =
			days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
  }

  updateCounter();

  countdown = setInterval(updateCounter, 1000);
})();


// FOR REACT...if implemented later
// countdown = setInterval(() => {
//   if(document.querySelector('body').classList.contains('home')) {
//     updateCounter();
//   } else {
//     clearInterval(countdown);
//   }
// }, 1000);

