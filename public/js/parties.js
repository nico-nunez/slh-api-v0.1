(function() {
  const startDate = document.querySelector('#party-start');
  const endDate = document.querySelector('#party-end');
  const showSecret = document.querySelector('#party-secret-show');

  // --- PARTIES/NEW ---
  const setDateInputs = () => {
    const formatDate = dateObj => {
      const monthStr = String(dateObj.getMonth() + 1);
      const monthFormatted = '0'.repeat(2 - monthStr.length) + monthStr;
      const dateStr = String(dateObj.getDate());
      const dateFormatted = '0'.repeat(2 - dateStr.length) + dateStr;
      return `${dateObj.getFullYear()}-${monthFormatted}-${dateFormatted}`
    }

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
    
    const handleDateChange = evt => {
      const dateArr = evt.target.value.split('-');
      const dateStr = dateArr.join('/')
      const newMinEnd = new Date(dateStr);

      newMinEnd.setDate(newMinEnd.getDate() + 1);
      
      endDate.value = formatDate(newMinEnd);
      endDate.setAttribute('min', formatDate(newMinEnd));
    }

    startDate.addEventListener('change', handleDateChange);
  }



  // --- PARTIES/SHOW ---
  const handleToggleShowSecret = evt => {
    const elem = evt.target;
    elem.textContent = elem.textContent === 'show' ? 'hide' : 'show';
    document.querySelector('#party-secret').classList.toggle('hidden');
  }

  // --- PARTIES/NEW ---
  if(startDate && endDate)
    setDateInputs();

  // --- PARTIES/SHOW ---
  if(showSecret)
    showSecret.addEventListener('click', handleToggleShowSecret);


})();