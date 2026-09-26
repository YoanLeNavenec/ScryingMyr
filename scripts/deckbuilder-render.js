// Rendering the deck (grid + list views), grid keyboard navigation, and the stats bar.

// Render the deck in grid view
function renderGridView() {
    const sortedGroups = groupAndSortDeck(window.currentDeck, groupSelector.value, sortSelector.value)

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
              cardEl.appendChild(badge)
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
            loadCardImage(card, cardEl)
        })

        section.appendChild(cardGrid)
        deckGrid.appendChild(section)
    })
}

//keyboard navigation for the deck in grid view
deckGrid.addEventListener('keydown', e => {
    const cards = Array.from(document.querySelectorAll('.deck-card'))
    const current = document.querySelector('.deck-card.focused')

    if (e.key === 'ArrowRight') {
        e.preventDefault()
        const currentIndex = current ? cards.indexOf(current) : -1
        const nextIndex = (currentIndex + 1) % cards.length
        current?.classList.remove('focused')
        cards[nextIndex]?.classList.add('focused')
        cards[nextIndex]?.scrollIntoView({ block: 'nearest' })
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const currentIndex = current ? cards.indexOf(current) : 0
        const prevIndex = (currentIndex - 1 + cards.length) % cards.length
        current?.classList.remove('focused')
        cards[prevIndex]?.classList.add('focused')
        cards[prevIndex]?.scrollIntoView({ block: 'nearest' })
    }
})

// Render the deck in list view
function renderListView() {
    const sortedGroups = groupAndSortDeck(window.currentDeck, groupSelector.value, sortSelector.value)

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
            rowName.addEventListener('click', () => showCardImage(card))

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

// Render the deck based on the selected view (grid or list)
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

// Update the stats bar with deck information
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

  const commanders = window.currentDeck.filter(c => c.isCommander)
  const allCommanders = commanders.map(commander => commander.name)
  if (allCommanders.length === 0) {
    document.querySelector('.deck-commander').textContent = 'None'
    } else {
        const cleanAllCommanders = allCommanders.join(' & ')
        document.querySelector('.deck-commander').textContent = cleanAllCommanders
    }

  document.querySelector('.deck-colors').textContent =
    `W: ${colorCounts.W} · U: ${colorCounts.U} · B: ${colorCounts.B} · R: ${colorCounts.R} · G: ${colorCounts.G}${colorCounts.C > 0 ? ` · C: ${colorCounts.C}` : ''}`
  document.querySelector('.deck-avgcmc').textContent = `Avg CMC: ${avgCMC}`
}
