formatDates(); // format MM-DD-YYYY
formatLastUpdated();
const passIcons = document.querySelectorAll('.password-eye-con');

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

if (passIcons.length) {
  const handleShowPassword = evt => {
    const icon = evt.target;
    const input = icon.previousElementSibling;
    const toggleType = input.type === 'password' ? 'text' : 'password';
    input.type = toggleType;
    icon.classList.toggle('fa-eye')
    icon.classList.toggle('fa-eye-slash')
  };

  Array.from(passIcons).forEach(icon => {
    icon.addEventListener('click', handleShowPassword);
  });
};

