const datesFull =  document.querySelectorAll('.date-full');

for (const date of datesFull) {
    date.innerHTML = dayjs().format('MM-DD-YYYY');
}