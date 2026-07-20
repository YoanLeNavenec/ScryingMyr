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
    if (document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA') return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      console.log('current:', current)
      console.log('results:', results.length)
      if (!current) {
          results[0]?.classList.add('focused')
        } else {
          const next = current.nextElementSibling
          console.log('next:', next)
          current.classList.remove('focused')
          if (next) next.classList.add('focused')
          else results[0]?.classList.add('focused')
        }
    } 
  });
});