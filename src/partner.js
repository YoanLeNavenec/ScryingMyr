function getPartnerInfo(card) {
  const text = card.text || ''
  const type = card.type || ''

  const PartnerWithMatch = text.match(/Partner with ([^(\n]+)/)
  if (PartnerWithMatch) return { type: 'Partner With', partner: PartnerWithMatch[1].trim()}

  const taggedMatch = text.match(/Partner-([^(\n]+)/)
  if (taggedMatch) return { kind: 'tagged', group: taggedMatch[1].trim().toLowerCase()}

  if (/\bFriends forever\b/.test(text)) return {kind: 'tagged', group: 'friends forever'}
  if (/\bPartner\b/.test(text)) return {kind: 'tagged', group: 'partner'}
  if (/Choose a Background/.test(text)) return {kind: 'choose-background'}
  if (/Doctor's Companion/.test(type)) return {kind: 'doctors-companion'}

    return null
}

function arePartners(cardA, cardB) {
  const a = getPartnerInfo(cardA)
  const b = getPartnerInfo(cardB)
  if (!a || !b) return false

  if (a.kind === 'tagged' && b.kind === 'tagged') return a.group === b.group
  if (a.kind === 'partner-with') return cardB.name === a.target
  if (b.kind === 'partner-with') return cardA.name === b.target

  if (a.kind === 'choose-background') return (cardB.type || '').includes('Background')
  if (b.kind === 'choose-background') return (cardA.type || '').includes('Background')

  if (a.kind === 'doctors-companion') return /-Time Lord Dctor$/.test(cardB.type || '')
  if (b.kind === 'doctors-companion') return /-Time Lord Dctor$/.test(cardA.type || '')

  return false
}

module.exports = { getPartnerInfo, arePartners }