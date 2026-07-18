const deckGrid = document.querySelector('.deck-grid')
const viewSelect = document.querySelector('.deck-view-select')

function getTypeGroup(card) {
  if (card.isCommander) return 'Commander'
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
  Object.entries(groups).forEach(([groupName, cards]) => {
    const section = document.createElement('div')
    section.classList.add('deck-section')

    const header = document.createElement('p')
    header.classList.add('deck-section-header')
    header.textContent = `${groupName} (${cards.length})`
    section.appendChild(header)

    const cardGrid = document.createElement('div')
    cardGrid.classList.add('deck-card-grid')

    cards.forEach(card => {
      const cardEl = document.createElement('div')
      cardEl.classList.add('deck-card')
      
      const cardTop = document.createElement('div')
      cardTop.classList.add('deck-card-top')

      const cardName = document.createElement('p')
      cardName.classList.add('deck-card-name')
      cardName.textContent = card.name
      
      const cardMana = document.createElement('p')
      cardMana.classList.add('deck-card-mana')
      cardMana.textContent = card.manaCost || ''

      cardTop.appendChild(cardName)
      cardTop.appendChild(cardMana)

      const cardType = document.createElement('p')
      cardMana.classList.add('deck-card-type')
      cardType.textContent = card.type || ''

      const cardText = document.createElement('p')
      cardText.classList.add('deck-card-text')
      cardText.textContent = card.text || ''

      const cardPT = document.createElement('p')
      cardPT.classList.add('deck-card-pt')
      if (card.power && card.toughness) {
        cardPT.textContent = `${card.power}/${card.toughness}`
      }

      cardEl.appendChild(cardTop)
      cardEl.appendChild(cardType)
      cardEl.appendChild(cardText)
      cardEl.appendChild(cardPT)
      cardGrid.appendChild(cardEl)
    })
    
    section.appendChild(cardGrid)
    deckGrid.appendChild(section)
  })
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