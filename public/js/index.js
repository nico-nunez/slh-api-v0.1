formatDates(); // format MM-DD-YYYY
formatLastUpdated();


function formatDates() {
    const datesFull =  document.querySelectorAll('.date-full');
    for (const date of datesFull) {
        const dateText = date.textContent;
        date.innerHTML = dayjs(dateText).add(1, 'day').format('MM-DD-YYYY');
    }
    
}



function formatLastUpdated(dates) {
    const updatedDates = document.querySelectorAll('.updatedAt');
    for (const date of updatedDates) {
        const dateText = date.textContent;
        date.innerHTML = dayjs(dateText).from(dayjs());
    }
}

const test = setInterval(() => {
  if(document.querySelector('body').classList.contains('home')) {
    console.log('home page');
  } else {
    clearInterval(test);
    console.log('not home');
  }
}, 1000);