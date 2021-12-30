(function () {
  let countdown;
  clearInterval(countdown)
  const currentYear = new Date().getFullYear();
  let xmas = new Date(`Dec 25, ${currentYear} 00:00:00`);
  const today = Date.now();
  if (xmas.getTime() < today)
      xmas.setFullYear(currentYear + 1);
  const countDownDate = xmas.getTime();
  // Update the count down every 1 second
  countdown = setInterval(function() {
  // Get today's date and time
      const now = new Date().getTime();
      // Find the distance between now and the count down date
      const distance = countDownDate - now;
      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      // Display the result in the element with id="demo"
      document.getElementById("countdown").innerHTML = days + "d " + hours + "h "
      + minutes + "m " + seconds + "s ";
      // If the count down is finished, write some text
      if (distance < 0) {
          clearInterval(x);
          document.getElementById("demo").innerHTML = "EXPIRED";
      }
  }, 1000);
})()