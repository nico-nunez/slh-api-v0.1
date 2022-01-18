(function() {
  const startDate = document.querySelector('#party-start');
  const endDate = document.querySelector('#party-end');

  const minStart = new Date();
  minStart.setDate(minStart.getDate() + 1);

  const maxStart = new Date();
  maxStart.setFullYear(maxStart.getFullYear() + 2);

  const minEnd = new Date(minStart);
  minEnd.setDate(minEnd.getUTCDate() + 1);

  const maxEnd = new Date(minStart);
  maxEnd.setFullYear(maxEnd.getFullYear() + 2);

  startDate.value = formatDate(minStart);
  startDate.setAttribute('min', formatDate(minStart));
  startDate.setAttribute('max', formatDate(maxStart));

  endDate.value = formatDate(minEnd);
  endDate.setAttribute('min', formatDate(minEnd));
  endDate.setAttribute('max', formatDate(maxEnd));
  
  startDate.addEventListener('change', handleDateChange);

  function handleDateChange(evt) {
    const dateArr = evt.target.value.split('-');
    const dateStr = dateArr.join('/')
    const newMinEnd = new Date(dateStr);

    newMinEnd.setDate(newMinEnd.getDate() + 1);
    
    endDate.value = formatDate(newMinEnd);
    endDate.setAttribute('min', formatDate(newMinEnd));
  }

  function formatDate(dateObj) {
    const monthStr = String(dateObj.getMonth() + 1);
    const monthFormatted = '0'.repeat(2 - monthStr.length) + monthStr;
    const dateStr = String(dateObj.getDate());
    const dateFormatted = '0'.repeat(2 - dateStr.length) + dateStr;
    return `${dateObj.getFullYear()}-${monthFormatted}-${dateFormatted}`
  }
})();