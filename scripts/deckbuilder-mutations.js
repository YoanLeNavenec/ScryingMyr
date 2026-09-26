// Adding/removing cards from the deck, and the add-card-modal search UI.

// Show the add card modal when the "Add Card" button is clicked
addCardBtn.addEventListener('click', () => {
  addCardModal.classList.remove('hidden')
  cardSearchInput.value = ''
  cardSearchResults.innerHTML = ''
  cardSearchInput.focus()
})

document.getElementById('add-card-cancel-btn').addEventListener('click', () => {
  addCardModal.classList.add('hidden')
})

// Search as you type
cardSearchInput.addEventListener('keyup', async (e) => {
  if (['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) return

    const query = cardSearchInput.value.trim()
    if (query.length < 2) {
        cardSearchResults.innerHTML = ''
        return
    }

    const results = await window.electronAPI.searchCards(query)
    cardSearchResults.innerHTML = ''

    results.forEach(card => {
        const result = document.createElement('div')
        result.classList.add('card-search-result')
        result.textContent = `${card.name} — ${card.type || ''}`
        result.addEventListener('click', () => {
            addCardToDecklist(card)
            addCardModal.classList.add('hidden')
        })
        cardSearchResults.appendChild(result)
    })
})

// Arrow key navigation + Enter to select
cardSearchInput.addEventListener('keydown', e => {
    const results = cardSearchResults.querySelectorAll('.card-search-result')
    const current = cardSearchResults.querySelector('.card-search-result.focused')

    if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!current) {
            results[0]?.classList.add('focused')
        } else {
            const next = current.nextElementSibling
            current.classList.remove('focused')
            if (next) next.classList.add('focused')
            else results[0]?.classList.add('focused')
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (current) {
            const prev = current.previousElementSibling
            current.classList.remove('focused')
            if (prev) prev.classList.add('focused')
            else results[results.length - 1]?.classList.add('focused')
        }
    } else if (e.key === 'Enter') {
        if (current) current.click()
    }

    if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!current) {
        results[0]?.classList.add('focused')
        results[0]?.scrollIntoView({ block: 'nearest' })
    } else {
        const next = current.nextElementSibling
        current.classList.remove('focused')
        if (next) {
            next.classList.add('focused')
            next.scrollIntoView({ block: 'nearest' })
        } else {
            results[0]?.classList.add('focused')
            results[0]?.scrollIntoView({ block: 'nearest' })
        }
    }
} else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (current) {
        const prev = current.previousElementSibling
        current.classList.remove('focused')
        if (prev) {
            prev.classList.add('focused')
            prev.scrollIntoView({ block: 'nearest' })
        } else {
            results[results.length - 1]?.classList.add('focused')
            results[results.length - 1]?.scrollIntoView({ block: 'nearest' })
        }
    }
}
})

//Add a card to the decklist
function addCardToDeck(card){
const existing = window.currentDeck.find(c => c.name === card.name)
if (existing) {
  existing.quantity += 1
} else {
  window.currentDeck.push({...card, quantity: 1, isCommander: false})
}
window.dispatchEvent(new CustomEvent('deck-updated'))
}

function addCardToDecklist(card){
  if (!isCardLegalInDeck(card, window.currentDeck)){ 
    showToast("This card isn't in the right colors!") 
    return 
  } 
  if (isDeckFull(window.currentDeck, formatSelector.value)){ 
    showToast("Your deck is already full! Time for cuts!") 
    return 
  }
  addCardToDeck(card)
  showToast(`${card.name} added to deck!`)
}


//Remove a card from the decklist
function removeCardFromDeck(card){
    const existing = window.currentDeck.find(c => c.name === card.name)
    if (existing){
        existing.quantity -= 1
        if (existing.quantity <= 0){
            window.currentDeck = window.currentDeck.filter(c => c.name !== card.name)
        }
    }
    window.dispatchEvent(new CustomEvent('deck-updated'))
}

function removeCardFromDecklist(card){
    removeCardFromDeck(card)
    showToast(`${card.name} removed from deck!`)
}
