const deckGrid = document.querySelector('.deck-grid')
const viewSelect = document.querySelector('.deck-view-select')

function getTypeGroup(card) {
  const type = card.type || ''
  if (type.includes('Creature')) return 'Creatures'
  if (type.includes('Planeswalker')) return 'Planeswalkers'
  if (type.includes('Instant')) return 'Instants'
  if (type.includes('Sorcery')) return 'Sorceries'
  if (type.includes('Artifact')) return 'Artifacts'
  if (type.includes('Enchantment')) return 'Enchantments'
  if (type.includes('Land')) return 'Lands'
  if (type.includes('Battle')) return 'Battles'
  return 'Other'
}

function renderGridView(){
  const groups = window.currentDeck.reduce((acc, card)=> {
    const group = getTypeGroup(card)
    if (!acc[group]) acc[group] = []
    acc[group].push(card)
    return acc
  }, {}) 
}

function renderListView(){

}

function renderDeck() {
  const view = viewSelect.value 
  deckGrid.innerHTML = ''

  if (!window.currentDeck || window.currentDeck.length === 0) {
    deckGrid.innerHTML = '<p class="empty deck">This deck is empty! Ask Scrying Myr for help!</p>'
    return
  }
  if (view === 'grid') {
    renderGridView()
  } else {
    renderListView()
  }
}

window.addEventListener('deck-updated', renderDeck)
viewSelect.addEventListener('change', renderDeck)