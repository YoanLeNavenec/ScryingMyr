// Orchestration: format/group/sort change listeners and the main deck-updated listener
// that ties rendering, legality, and the pickers together. Loaded LAST.

// Update the deck when the format changes
formatSelector.addEventListener('change', () => {
    window.dispatchEvent(new CustomEvent('deck-updated'))
})

// Update the deck when the type of grouping changes
groupSelector.addEventListener('change', () => {
    window.dispatchEvent(new CustomEvent('deck-updated'))
})

sortSelector.addEventListener('change', () => { 
    window.dispatchEvent(new CustomEvent('deck-updated')) 
})

// Listen for deck updates and re-render the deck and stats bar
window.addEventListener('deck-updated', () => {
  renderDeck()
  updateStatsBar()
  if (getDeckColorIdentity(window.currentDeck).length > 0){
    window.currentDeck.forEach(card => {
        card.offColor = !isCardLegalInDeck(card, window.currentDeck)
    })
  }
  const deckbuilderVisible = !document.querySelector('.deckbuilding-view').classList.contains('hidden')
  if (deckbuilderVisible){ 
    showCommanderPicker(window.currentDeck)
    const commanderModalShowing = !document.getElementById('commander-modal').classList.contains('hidden')
    if (!commanderModalShowing) showCompanionPicker(window.currentSideboard, window.currentDeck)
  }
})

    viewSelect.addEventListener('change', renderDeck)

    window.addEventListener('deckbuilder-opened', () => {
    if (window.currentDeck && window.currentDeck.length > 0) {
        showCommanderPicker(window.currentDeck)
        const commanderModalShowing = !document.getElementById('commander-modal').classList.contains('hidden')
        if (!commanderModalShowing) showCompanionPicker(window.currentSideboard, window.currentDeck)
    }
    })

    document.addEventListener('keydown', e =>{
    if (e.key === 'Escape') {
        addCardModal.classList.add('hidden')
        document.getElementById('commander-modal').classList.add('hidden')
        document.getElementById('companion-modal').classList.add('hidden')
    }
    })
