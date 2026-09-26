// Color identity, Rulebreaker exceptions, ban status, and deck-legality checks.

//Checks Color Identity of the card 
function getColorIdentity(card) {
  const rule = window.electronAPI.getRulebreakerRule(card.name)
  if (rule && rule.kind === 'color-commander' && card.isCommander) {
    const chosenColor = getChosenColor(card)
    return [chosenColor].filter(Boolean)
  }

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

// Check if the deck has a commander with a basic land exception
function hasBasicLandException(deck){
    const commanders = deck.filter(c => c.isCommander)
    return commanders.some(commander => {
        const rule = window.electronAPI.getRulebreakerRule(commander.name)
        return rule && rule.exception === 'Basic Land'
    })
}

// Check if a card is a basic land type
function hasBasicLandType(card){
    const basicTypes = ['Mountain', 'Island', 'Swamp', 'Forest', 'Plains']
    return basicTypes.some(type => card.type.includes(type))
}

// Check if a land card's produced mana colors are legal for the deck's color identity
function isLandColorLegal(card, deckColors, deck){
    if (!hasBasicLandType(card)) return true
    if (hasBasicLandException(deck)) return true
    return (card.producedMana || []).every(color => deckColors.includes(color))
}

// Check if the commander is Grizzlegom, Hurloon Hero
function isGrizzlegomCommander(deck){
    const commanders = deck.filter(c => c.isCommander)
    return commanders.some(card => card.name === 'Grizzlegom, Hurloon Hero')
}

// Check if the commander is Whtz, the Bibliophile
function isWhtzCommander(deck){
    const commanders = deck.filter(c => c.isCommander)
    return commanders.some(card => card.name === 'Whtz, the Bibliophile')
}

// Check if the commander is a rulebreaker and if the card matches the rulebreaker's exception
function isRulebreakerMatch(card, types){
    return types.some(type => card.type.includes(type))
}

// Prompt the user to choose a color for a card if it has a rulebreaker exception
function getChosenColor(card){
    if (!card.chosenColor){
        let color = prompt(`Pick a color ! (W, U, B, R, G):`)
        const validColors = ['W', 'U', 'B', 'R', 'G']
        card.chosenColor = color && validColors.includes(color.toUpperCase()) ? color.toUpperCase() : null
    }
    return card.chosenColor
}

// Check if a card matches a rulebreaker exception based on the deck's commanders
function matchesRulebreakerException(card, deck){
    const commanders = deck.filter(c => c.isCommander)

    return commanders.some(commander => {
        const rule = window.electronAPI.getRulebreakerRule(commander.name)
        if (!rule) return false
        if (rule.kind === 'creature-type' || rule.kind === 'type-list') {
            return isRulebreakerMatch(card, rule.types)
        }
        if (rule.kind === 'min-mv-creature' && card.manaValue >= rule.value && card.type.includes('Creature')){
            return true
        }
        if (rule.kind === 'instant-sorcery-choice'){
            if (!card.type.includes('Instant') && !card.type.includes('Sorcery')) return false
            const chosenColor = getChosenColor(commander)
            const allowedColors = [...getColorIdentity(commander), chosenColor].filter(Boolean)
            return getColorIdentity(card).every(color => allowedColors.includes(color))
        }
        return false
    })
}

// Check if the deck has reached its size limit
function isDeckFull(deck, format){
    if (isWhtzCommander(deck)) return false
    const limit = deckSizeLimits[format]
    if (!limit) return false
    const totalCards = deck.reduce((sum, card) => sum + (card.quantity || 1), 0)
    return totalCards >= limit
}

// Check if a card is legal in the deck
function isCardLegalInDeck(card, deck){
    const commanders = deck.filter(c => c.isCommander)
    if (commanders.length === 0) return true
    const deckColors = getDeckColorIdentity(deck)
    const cardColors = getColorIdentity(card)
    if (card.type.includes('Land') && isGrizzlegomCommander(deck)) return true
    if (hasBasicLandType(card) && hasBasicLandException(deck)) return true
    if (matchesRulebreakerException(card, deck)) return true
    return cardColors.every(color => deckColors.includes(color)) && isLandColorLegal(card, deckColors, deck)
}

// Check if a card exists in more than one copy in the deck
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
