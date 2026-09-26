// Commander/companion/color/card-image modals and their keyboard navigation.

document.getElementById('card-image-close-btn').addEventListener('click', () => {
    cardImageModal.classList.add('hidden')
})

// Show the card image modal when a card is clicked
async function showCardImage(card) {
    const imagePath = await window.electronAPI.getCardImage(card.name)
    document.getElementById('card-image-content').src = 'file://' + imagePath
    cardImageModal.classList.remove('hidden')
}

// Load the card image and display it in grid view
async function loadCardImage(card, cardEl) {
    try {
        const cardImage = await window.electronAPI.getCardImage(card.name)
        const cardImg = document.createElement('img')
        cardImg.src = 'file://' + cardImage
        cardImg.classList.add('deck-card-image')
        cardEl.appendChild(cardImg)
        cardEl.classList.add('has-image')
    } catch (error) {
        console.log("couldn't find card image!")
    }
}

// Show the commander picker modal if the deck has no commander
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

    // Function to handle commander selection and partner selection
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

                    const rule = window.electronAPI.getRulebreakerRule(card.name)
                    if (rule && rule.kind === 'color-commander') {
                        showColorPicker(card)
                    } else {
                        window.dispatchEvent(new CustomEvent('deck-updated'))
                    }
                }
            })
            commanderList.appendChild(option)
        })
    }
    selectCommanderPartner(legendaries)

    document.getElementById('commander-modal').classList.remove('hidden')
    commanderList.focus()
}

// Show the color picker modal for a card with requiring color selection
function showColorPicker(card) {
    const colorList = document.getElementById('color-list')
    colorList.innerHTML = ''

    const colors = [
        { code: 'W', name: 'White' },
        { code: 'U', name: 'Blue' },
        { code: 'B', name: 'Black' },
        { code: 'R', name: 'Red' },
        { code: 'G', name: 'Green' }
    ]

    colors.forEach(color => {
        const option = document.createElement('div')
        option.classList.add('commander-option')
        option.textContent = color.name
        option.addEventListener('click', () => {
            card.chosenColor = color.code
            document.getElementById('color-modal').classList.add('hidden')
            window.dispatchEvent(new CustomEvent('deck-updated'))
        })
        colorList.appendChild(option)
    })

    document.getElementById('color-modal').classList.remove('hidden')
    colorList.focus()
}

// Show the companion picker modal if the deck has no companion
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
            addCompanionToDeck(card)
            document.getElementById('companion-modal').classList.add('hidden')
        })
        companionList.appendChild(option)
    })

    document.getElementById('companion-modal').classList.remove('hidden')
    companionList.focus()
}

function addCompanionToDeck(card){
    window.currentDeck.push({...card, isCompanion: true})
    window.currentSideboard = window.currentSideboard.filter(c => c.name !== card.name)
    window.dispatchEvent(new CustomEvent('deck-updated'))
}

    document.getElementById('companion-skip-btn').addEventListener('click', () => {
        document.getElementById('companion-modal').classList.add('hidden')
    })

    document.getElementById('commander-skip-btn').addEventListener('click', () => {
        document.getElementById('commander-modal').classList.add('hidden')
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
