const ThemeEl = document.documentElement;
ThemeEl.setAttribute('data-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const ThemeButton = document.querySelector('.dark-light');

ThemeButton.addEventListener('click', () => {
  if (ThemeEl.getAttribute('data-theme') === 'dark') {
    ThemeEl.setAttribute('data-theme', 'light');
  } else {
    ThemeEl.setAttribute('data-theme', 'dark');
  }
});