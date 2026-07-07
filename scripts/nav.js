const AllNav = document.querySelectorAll(".nav-item")
AllNav.forEach(item => {
item.addEventListener('click', () => {
AllNav.forEach(navItem => { navItem.classList.remove('active')})
item.classList.add('active')})
});