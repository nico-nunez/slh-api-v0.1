const datesFull =  document.querySelectorAll('.date-full');

for (const date of datesFull) {
    const dateText = date.textContent;
    date.innerHTML = dayjs(dateText).add(1, 'day').format('MM-DD-YYYY');
}