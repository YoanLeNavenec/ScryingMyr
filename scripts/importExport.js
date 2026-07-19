const importInput = document.querySelector('.import-input')
const importBtn = document.querySelector('.import-btn')
const formatSelect = document.querySelector('.format-selector')
const exportOutput = document.querySelector('.export-output')
const exportBtns = document.querySelectorAll('.export-btn')

window.currentDeck = []

importBtn.addEventListener('click', async function(){
  const text = importInput.value 
  const format = formatSelect.value 
  const result = window.electronAPI.importDeck(text, format)
  console.log(result)
  if (result && result.length > 0){
    const enriched = await Promise.all(result.map(async card => {
      const fullCard = await window.electronAPI.lookupCard(card.name)
      return fullCard ? {...fullCard, quantity: card.quantity, isCommander: card.isCommander} : card
    }))
    window.currentDeck = enriched
    window.dispatchEvent(new CustomEvent('deck-updated'))
    showToast('Deck imported! Check the deckbuilder tab.')
  }
})

exportBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!window.currentDeck || window.currentDeck.length === 0) return
    exportOutput.value = window.electronAPI.exportDeck(window.currentDeck)
  })
})