// Card grouping and sorting logic for the deck views (grid/list).

const groupFunctions = { type: getTypeGroup, cmc: getCmcGroup, color: getColorGroup }
const groupOrders = {
        type: ['Commander', 'Companion', 'Planeswalkers', 'Creatures', 'Sorceries', 'Instants', 'Artifacts', 'Enchantments', 'Battles', 'Lands', 'Other'],
        cmc: ['Commander', 'Companion', '0', '1', '2', '3', '4', '5', '6', '7+', 'Lands'],
        color: ['Commander', 'Companion', 'White', 'Blue', 'Black', 'Red', 'Green', 'Multicolored', 'Colorless', 'Lands'],
    }

// Determine the type group of a card for sorting and grouping
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

//Determine a card's CMC group
function getCmcGroup(card) {
    if (card.isCommander) return 'Commander'
    if (card.isCompanion) return 'Companion'
    if (card.type.includes('Land')) return 'Lands'
    const CMC = card.manaValue || 0
    if (CMC >= 7) return '7+'
    return `${CMC}`
}

//Determine a card's color group
function getColorGroup(card) {
    if (card.isCommander) return 'Commander'
    if (card.isCompanion) return 'Companion'
    if (card.type.includes('Land')) return 'Lands'
    const colorIdentity = getColorIdentity(card)
    const colorNames = { W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green' }
    if (colorIdentity.length === 0) return 'Colorless'
    if (colorIdentity.length === 1) return colorNames[colorIdentity[0]]
    if (colorIdentity.length > 1) return 'Multicolored'
}

// Group and sort the deck by card type
function groupAndSortDeck(deck, groupBy, sortBy) {
    const getGroup = groupFunctions[groupBy]

    const groups = deck.reduce((acc, card) => {
        const group = getGroup(card)
        if (!acc[group]) acc[group] = []
        acc[group].push(card)
        return acc
    }, {})
    const order = groupOrders[groupBy]

    const sortedEntries = Object.entries(groups).map(([groupName, cards]) => {
        return [groupName, sortCards(cards, sortBy)]
    })

    return sortedEntries.sort(([a], [b]) => {
        return order.indexOf(a) - order.indexOf(b)
    })
}

//sort cards in a group
function sortCards(cards, sortBy) {
    if (sortBy === 'name') {
        return cards.sort((a, b) => {
           if (a.name < b.name) return -1
           if (a.name > b.name) return 1
           return 0
        })
    } else {
        return cards.sort((a, b) => {
            const groupA = groupFunctions[sortBy](a)
            const groupB = groupFunctions[sortBy](b)
            const indexA = groupOrders[sortBy].indexOf(groupA)
            const indexB = groupOrders[sortBy].indexOf(groupB)
            return indexA - indexB
        })
    }
}
