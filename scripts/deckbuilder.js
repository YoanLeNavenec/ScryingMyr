const deckGrid = document.querySelector('.deck-grid')
const viewSelect = document.querySelector('.deck-view-select')
const formatSelector = document.querySelector('.deck-format-selector')
const singletonFormats = ['commander', 'cedh', 'duelcommander']
const addCardBtn = document.querySelector('.deck-add-btn')
const addCardModal = document.getElementById('add-card-modal')
const cardSearchInput = document.getElementById('card-search-input')
const cardSearchResults = document.getElementById('card-search-results')

function getTypeGroup(card) {
    if (card.isCommander) return 'Commander'
    if (card.isCompanion) return 'Companion'
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

//Checks Color Identity of the card 
function getColorIdentity(card) {
  if (card.colorIdentity && card.colorIdentity.length > 0) return card.colorIdentity

  const colors = ['W', 'U', 'B', 'R', 'G']
  const source = `${card.manaCost || ''} ${card.text || ''}`
  const symbols = source.match(/\{[^}]+\}/g) || []

  const found = new Set()
  symbols.forEach(symbol => {
    colors.forEach(color => {
      if (symbol.includes(color)) found.add(color)
    })
  })

  return colors.filter(c => found.has(c))
}

//sets deck's color identity
function getDeckColorIdentity(deck){
    const commanders = deck.filter(c => c.isCommander)
    const allColors = commanders.flatMap(c => getColorIdentity(c))
    const uniqueColors = [...new Set(allColors)]
    const order = ['W', 'U', 'B', 'R', 'G']
    return order.filter(c => uniqueColors.includes(c))
}

function isCardLegalInDeck(card, deck){
    const deckColors = getDeckColorIdentity(deck)
    const cardColors = getColorIdentity(card)
    return cardColors.every(color => deckColors.includes(color))
}

function isDuplicateViolation(card){
  if (!singletonFormats.includes(formatSelector.value)) return false
  if (card.quantity <= 1) return false

  const basicLands = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Wastes', 
    'Snow-Covered Plains', 'Snow-Covered Island', 'Snow-Covered Swamp','Snow-Covered Mountain', 'Snow-Covered Forest', 'Snow-Covered Wastes']
    if (basicLands.includes(card.name)) return false

    const text = card.text || ''
    if (text.includes('any number of cards named') || text.match(/up to \d+ of cards named/)) return false

    const limitMatch = text.match(/up to (\w+) cards? named/i)
    if (limitMatch) {
      const wordToNum = {'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10 }
      const limit = wordToNum[limitMatch[1].toLowerCase()] || parseInt(limitMatch[1])
      if (!isNaN(limit) && card.quantity <= limit) return false
    }

    return true
}

addCardBtn.addEventListener('click', () => {
  addCardModal.classList.remove('hidden')
  cardSearchInput.value = ''
  cardSearchResults.innerHTML = ''
  cardSearchInput.focus()
})
document.getElementById('add-card-cancel-btn').addEventListener('click', () => {
  addCardModal.classList.add('hidden')
})

//Check if the card is banned
function getBanStatus(card, format) {
    if (window.electronAPI.isOffensive(card.name)) return true
    
    if (format === 'commander' || format === 'cedh') {
        const banned = window.electronAPI.getBanlist(card.name, format, 'banned')
        const asCompanion = card.isCompanion ? window.electronAPI.getBanlist(card.name, format, 'banned_as_companion') : false
        return banned || asCompanion
    }

    if (format === 'duelcommander') {
        const inDeck = window.electronAPI.getBanlist(card.name, format, 'banned_in_deck')
        const offensive = window.electronAPI.getBanlist(card.name, format, 'banned_offensive_content')
        const asCommander = card.isCommander ? window.electronAPI.getBanlist(card.name, format, 'banned_as_commander') : false
        const asCompanion = card.isCompanion ? window.electronAPI.getBanlist(card.name, format, 'banned_as_companion') : false
        return inDeck || offensive || asCommander || asCompanion
    }
    showToast('Oops! We havent added this format yet!')
    return false
}

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

function addCardToDecklist(card){
  if (!isCardLegalInDeck(card, window.currentDeck)){
    showToast("This card isn't in the right colors!")
    return
  }
  const existing = window.currentDeck.find(c => c.name === card.name)
  if (existing) {
    existing.quantity += 1
  } else {
    window.currentDeck.push({...card, quantity: 1, isCommander: false})
  }
  window.dispatchEvent(new CustomEvent('deck-updated'))
  updateStatsBar()
  showToast(`${card.name} added to deck!`)
}

function removeCardFromDecklist(card){
    const existing = window.currentDeck.find(c => c.name === card.name)
        if (existing){
            existing.quantity -= 1
            if (existing.quantity <= 0){
                window.currentDeck = window.currentDeck.filter(c => c.name !== card.name)
            }
        }
    window.dispatchEvent(new CustomEvent('deck-updated'))
    updateStatsBar()
    showToast(`${card.name} removed from deck!`)
}

function groupAndSortDeck(deck) {
    const groups = deck.reduce((acc, card) => {
        const group = getTypeGroup(card)
        if (!acc[group]) acc[group] = []
        acc[group].push(card)
        return acc
    }, {})

    const groupOrder = ['Commander','Companion', 'Planeswalkers', 'Creatures', 'Sorceries', 'Instants', 'Artifacts', 'Enchantments', 'Battles', 'Lands', 'Other']
    return Object.entries(groups).sort(([a], [b]) => {
      return groupOrder.indexOf(a) - groupOrder.indexOf(b)
    })
}

function renderGridView() {
    const sortedGroups = groupAndSortDeck(window.currentDeck)

    sortedGroups.forEach(([groupName, cards]) => {
        const section = document.createElement('div')
        section.classList.add('deck-section')

        const header = document.createElement('p')
        header.classList.add('deck-section-header')
        const totalCount = cards.reduce((sum, card) => sum + (card.quantity || 1), 0)
        header.textContent = `${groupName} (${totalCount})`
        section.appendChild(header)

        const cardGrid = document.createElement('div')
        cardGrid.classList.add('deck-card-grid')

        cards.forEach(card => {
            const cardEl = document.createElement('div')
            cardEl.classList.add('deck-card')

            if (getBanStatus(card, formatSelector.value))
                cardEl.classList.add('illegal-card')

            const cardTop = document.createElement('div')
            cardTop.classList.add('deck-card-top')
            if (card.quantity > 1){
              const badge = document.createElement('span')
              badge.classList.add('deck-card-quantity')
              if (isDuplicateViolation(card)){
                badge.classList.add('deck-card-quantity--warning')
                badge.title = 'Warning: Only one copy per card allowed in this format!'
              }
              badge.textContent = `x${card.quantity}`
              cardTop.appendChild(badge)
            }

            const cardName = document.createElement('p')
            cardName.classList.add('deck-card-name')
            cardName.textContent = card.name

            const cardMana = document.createElement('p')
            cardMana.classList.add('deck-card-mana')
            cardMana.textContent = card.manaCost || ''

            cardTop.appendChild(cardName)
            cardTop.appendChild(cardMana)

            const cardType = document.createElement('p')
            cardType.classList.add('deck-card-type')
            cardType.textContent = card.type || ''

            const cardText = document.createElement('p')
            cardText.classList.add('deck-card-text')
            cardText.textContent = card.text || ''

            const cardPT = document.createElement('p')
            cardPT.classList.add('deck-card-pt')
            if (card.power && card.toughness) {
                cardPT.textContent = `${card.power}/${card.toughness}`
            }

            const cardDel = document.createElement('button')
            cardDel.textContent = 'X'
            cardDel.classList.add('deck-card-delete')
            cardDel.addEventListener('click', () => removeCardFromDecklist(card))

            if (card.offColor){
                const warningBadge = document.createElement('span')
                warningBadge.classList.add('deck-card-warning')
                warningBadge.textContent = '⚠️'
                warningBadge.title = "THis card doesn't fit your deck's color identity."
                cardEl.appendChild(warningBadge)
            }

            cardEl.appendChild(cardTop)
            cardEl.appendChild(cardType)
            cardEl.appendChild(cardText)
            cardEl.appendChild(cardPT)
            cardEl.appendChild(cardDel)
            cardGrid.appendChild(cardEl)
        })

        section.appendChild(cardGrid)
        deckGrid.appendChild(section)
    })
}

function renderListView() {
    const sortedGroups = groupAndSortDeck(window.currentDeck)

    sortedGroups.forEach(([groupName, cards]) => {
        const section = document.createElement('div')
        section.classList.add('deck-section')

        const header = document.createElement('p')
        header.classList.add('deck-section-header')
        const totalCount = cards.reduce((sum, card) => sum + (card.quantity || 1), 0)
        header.textContent = `${groupName} (${totalCount})`
        section.appendChild(header)

        const list = document.createElement('div')
        list.classList.add('deck-list')

        cards.forEach(card => {
            const row = document.createElement('div')
            row.classList.add('deck-list-row')

            if (getBanStatus(card, formatSelector.value))
                row.classList.add('illegal-card')

            const rowName = document.createElement('span')
            rowName.classList.add('deck-list-name')
            rowName.textContent = card.name
            rowName.title = card.name

            const rowMana = document.createElement('span')
            rowMana.classList.add('deck-list-mana')
            rowMana.textContent = card.manaCost || ''

            const rowType = document.createElement('span')
            rowType.classList.add('deck-list-type')
            rowType.textContent = card.type || ''
            rowType.title = card.type || ''

            const rowPT = document.createElement('span')
            rowPT.classList.add('deck-list-pt')
            if (card.power && card.toughness) {
                rowPT.textContent = `${card.power}/${card.toughness}`
            }

            const rowQty = document.createElement('span')
            rowQty.classList.add('deck-list-quantity')
            if (card.quantity > 1) {
                if (isDuplicateViolation(card)) {
                    rowQty.classList.add('deck-list-quantity--warning')
                    rowQty.title = 'Warning: Only one copy per card allowed in this format!'
                }
                rowQty.textContent = `x${card.quantity}`
            }

            const rowDel = document.createElement('button')
            rowDel.textContent = 'X'
            rowDel.classList.add('deck-row-delete')
            rowDel.addEventListener('click', () => removeCardFromDecklist(card))

            if (card.offColor) {
                const rowWarning = document.createElement('span')
                rowWarning.classList.add('deck-list-warning')
                rowWarning.textContent = '⚠️'
                rowWarning.title = "This card doesn't fit your deck's color identity."
                row.appendChild(rowWarning)
            }

            row.appendChild(rowName)
            row.appendChild(rowMana)
            row.appendChild(rowType)
            row.appendChild(rowPT)
            row.appendChild(rowQty)
            row.appendChild(rowDel)
            list.appendChild(row)
        })

        section.appendChild(list)
        deckGrid.appendChild(section)
    })
}

function renderDeck() {
    const view = viewSelect.value
    deckGrid.innerHTML = ''

    if (!window.currentDeck || window.currentDeck.length === 0) {
        deckGrid.innerHTML = '<p class="deck-empty">No cards yet. Ask Scrying Myr for help!</p>'
        return
    }

    if (view === 'grid') {
        renderGridView()
    } else {
        renderListView()
    }
}

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

function updateStatsBar(){
  const totalCards = window.currentDeck.reduce((sum, card) => {
    return sum + (card.quantity || 1)
  }, 0)
  const colorCounts = window.currentDeck.reduce((acc, card) => {
    const qty = card.quantity || 1
    if (!card.colorIdentity || card.colorIdentity.length === 0) {
      acc.C += qty
    } else {
      card.colorIdentity.forEach(color => {
        acc[color] += qty
      })
    }
    return acc
  }, {W: 0, U: 0, B:0, R:0, G:0, C: 0 })

  const totalMV = window.currentDeck.reduce((sum, card) => {
    return sum + ((card.manaValue || 0) * (card.quantity || 1))
  }, 0)
  const avgCMC = totalCards > 0 ? (totalMV / totalCards).toFixed(2) : '-'

  document.querySelector('.deck-count').textContent = `${totalCards} / 100 cards`
  document.querySelector('.deck-colors').textContent =
    `W: ${colorCounts.W} · U: ${colorCounts.U} · B: ${colorCounts.B} · R: ${colorCounts.R} · G: ${colorCounts.G}${colorCounts.C > 0 ? ` · C: ${colorCounts.C}` : ''}`
  document.querySelector('.deck-avgcmc').textContent = `Avg CMC: ${avgCMC}`
}

function showCommanderPicker(deck) {
    const hasCommander = deck.some(c => c.isCommander)
    if (hasCommander) return

    const legendaries = deck.filter(c => c.type && c.type.includes('Legendary') && c.type.includes('Creature'))
    if (legendaries.length === 0) return

    const hasPartnerPair = legendaries.some(cardA =>
      deck.some(cardB => cardB.name !== cardA.name && window.electronAPI.cardPartners(cardA, cardB))
    )

    const partnerLabel = document.getElementById('partner-checkbox-label')
    if (hasPartnerPair) {
      partnerLabel.classList.remove('hidden')
    } else {
      partnerLabel.classList.add('hidden')
      document.getElementById('partner-checkbox').checked = false
    }

    const commanderList = document.getElementById('commander-list')

    function selectCommanderPartner(candidates) {
        commanderList.innerHTML = ''

        const modalMessage = document.getElementById('commander-modal-message')
        if (deck.some(c => c.isCommander)) {
          modalMessage.textContent = "Pick your partner!"
        } else {
          modalMessage.textContent = "I sadly couldn't recognize your commander. Can you tell me who it is?"
        }

        candidates.forEach(card => {
            const option = document.createElement('div')
            option.classList.add('commander-option')
            option.textContent = card.name
            option.addEventListener('click', () => {
                const partnerMode = document.getElementById('partner-checkbox').checked
                const alreadyHasCommander = deck.some(c => c.isCommander)

                if (partnerMode && !alreadyHasCommander) {
                    card.isCommander = true
                    const validPartners = deck.filter(c => window.electronAPI.cardPartners(c, card) && c.name !== card.name)
                    selectCommanderPartner(validPartners)
                } else {
                    card.isCommander = true
                    document.getElementById('commander-modal').classList.add('hidden')
                    window.dispatchEvent(new CustomEvent('deck-updated'))
                }
            })
            commanderList.appendChild(option)
        })
    }

    selectCommanderPartner(legendaries)

    document.getElementById('commander-modal').classList.remove('hidden')
    commanderList.focus()
}

function showCompanionPicker(sideboard, deck) {
    const hasCompanion = deck.some(c => c.isCompanion)
    if (hasCompanion) return

    const hasSideboard = sideboard.length > 0
    if (!hasSideboard) return

    const validCompanion = sideboard.filter(c => window.electronAPI.findCompanion(deck, c.name))
    if (validCompanion.length === 0) return

    const companionList = document.getElementById('companion-list')
    companionList.innerHTML = ''
    validCompanion.forEach(card => {
        const option = document.createElement('div')
        option.classList.add('companion-option')
        option.textContent = card.name
        option.addEventListener('click', () => {
            window.currentDeck.push({...card, isCompanion: true})
            window.currentSideboard = window.currentSideboard.filter(c => c.name !== card.name)
            document.getElementById('companion-modal').classList.add('hidden')
            window.dispatchEvent(new CustomEvent('deck-updated'))
        })
        companionList.appendChild(option)
    })

    document.getElementById('companion-modal').classList.remove('hidden')
    companionList.focus()
}

document.getElementById('companion-skip-btn').addEventListener('click', () => {
    document.getElementById('companion-modal').classList.add('hidden')
})

document.getElementById('commander-skip-btn').addEventListener('click', () => {
    document.getElementById('commander-modal').classList.add('hidden')
})

window.addEventListener('deck-updated', () => {
    renderDeck()
    const deckbuilderVisible = !document.querySelector('.deckbuilding-view').classList.contains('hidden')
    if (deckbuilderVisible) { 
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

document.getElementById('commander-list').addEventListener('keydown', e => {
    const options = document.querySelectorAll('.commander-option')
    const current = document.querySelector('.commander-option.focused')

    if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!current) {
            options[0]?.classList.add('focused')
            options[0]?.scrollIntoView({ block: 'nearest' })
        } else {
            const next = current.nextElementSibling
            current.classList.remove('focused')
            if (next) {
                next.classList.add('focused')
                next.scrollIntoView({ block: 'nearest' })
            } else {
                options[0]?.classList.add('focused')
                options[0]?.scrollIntoView({ block: 'nearest' })
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
                options[options.length - 1]?.classList.add('focused')
                options[options.length - 1]?.scrollIntoView({ block: 'nearest' })
            }
        }
    } else if (e.key === 'Enter') {
        if (current) current.click()
    }
})

document.getElementById('companion-list').addEventListener('keydown', e => {
    const options = document.querySelectorAll('.companion-option')
    const current = document.querySelector('.companion-option.focused')

    if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!current) {
            options[0]?.classList.add('focused')
            options[0]?.scrollIntoView({ block: 'nearest' })
        } else {
            const next = current.nextElementSibling
            current.classList.remove('focused')
            if (next) {
                next.classList.add('focused')
                next.scrollIntoView({ block: 'nearest' })
            } else {
                options[0]?.classList.add('focused')
                options[0]?.scrollIntoView({ block: 'nearest' })
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
                options[options.length - 1]?.classList.add('focused')
                options[options.length - 1]?.scrollIntoView({ block: 'nearest' })
            }
        }
    } else if (e.key === 'Enter') {
        if (current) current.click()
    }
})