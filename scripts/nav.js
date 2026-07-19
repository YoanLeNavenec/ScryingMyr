document.addEventListener('DOMContentLoaded', () => {
  const AllNav = document.querySelectorAll(".nav-item")
  AllNav.forEach(item => {
      item.addEventListener('click', (e) => {
          // Active nav state
          AllNav.forEach(navItem => { navItem.classList.remove('active') })
          item.classList.add('active')
          
          // Find the target view
          const navButton = item.querySelector('button')
          const targetView = document.querySelector('.' + navButton.dataset.view)
          
          // Switch views
          const allViews = document.querySelectorAll('.view')
          allViews.forEach(view => {
            view.classList.add('hidden')
            view.classList.remove('active-view')
          });
          targetView.classList.remove('hidden')
          targetView.classList.add('active-view')

          if (navButton.dataset.view === 'deckbuilding-view'){
            window.dispatchEvent(new CustomEvent('deckbuilder-opened'))
          }
      })
  });

  // Arrow key navigation
  const navList = document.querySelector('.app-nav ul')
  const navButtons = navList.querySelectorAll('button')

  navList.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const currentIndex = Array.from(navButtons).indexOf(document.activeElement);
      const nextIndex = (currentIndex + (e.key === 'ArrowDown' ? 1 : -1) + navButtons.length) % navButtons.length;
      navButtons[nextIndex].focus();
    };
  });
});