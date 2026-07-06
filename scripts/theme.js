const ThemeEl = document.documentElement;
const ThemeButton = document.querySelector('.dark-light');

ThemeButton.addEventListener('click', () => {
  if (ThemeEl.getAttribute('data-theme') === 'dark') {
    ThemeEl.setAttribute('data-theme', 'light');
  } else {
    ThemeEl.setAttribute('data-theme', 'dark');
  }
});