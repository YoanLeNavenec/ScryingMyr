const companions = require('../data/companions.json')

function meetsCompanionRequirement(deck, companionName){
  const rule = companions[companionName]
  if (!rule) return false
  
  const nonlandCards = deck.filter(c => !c.type.includes('Land'))
  const permanantCards = deck.filter(c => !c.type.includes("Instant") && !c.type.includes("Sorcery"))
  const cardTypes = ['Creature', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Planeswalker', 'Battle']

  switch (rule.kind){
    case 'even-mv':
     return nonlandCards.every(c=>c.manaValue % 2 === 0)
    case 'odd-mv':
     return nonlandCards.every(c=>c.manaValue % 2 === 1)
    case 'min-mv':
     return nonlandCards.every(c =>c.manaValue >= rule.value)
    case 'max-mv':
      return permanantCards.every(c => c.manaValue <= rule.value)
    case 'subtype-list':
      return nonlandCards.every(c => rule.types.some(type => c.type.includes(type)))
    case 'shared-type':
      return cardTypes.some(type => nonlandCards.every(c.type.includes(type)))
    case 'singleton':
      return !deck.some(c => isDuplicateViolation(c))
    case 'no-repeated-symbol':
      return nonlandCards.every(c =>{
        const symbols = c.manaCost.match(/\{[^}]+\}/g) || []
        return new Set(symbols).size === symbols.length
      }) 
    case 'has-activated-ability':
      return permanantCards.every(c => /\{[^}]+\}\s*:/.test((c.text || '')))
    default:
      return false
  }

}

module.exports = {meetsCompanionRequirement}