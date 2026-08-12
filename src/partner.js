function getPartnerInfo(card) {
  const text = card.text || ''
  const type = card.type || ''

  const partnerWithMatch = text.match(/Partner with ([^(\n]+)/)
  if (partnerWithMatch) return { kind: 'partner-with', target: partnerWithMatch[1].trim() }

  const taggedMatch = text.match(/Partner—([^(\n]+)/)
  if (taggedMatch) return { kind: 'tagged', group: taggedMatch[1].trim().toLowerCase() }

  if (/\bFriends forever\b/.test(text)) return { kind: 'tagged', group: 'friends forever' }
  if (/\bPartner\b/.test(text)) return { kind: 'tagged', group: 'partner' }
  if (/Choose a Background/.test(text)) return { kind: 'choose-background' }
  if (/Doctor's companion/.test(text)) return { kind: 'doctors-companion' }

  return null
}

function arePartners(cardA, cardB) {
  const a = getPartnerInfo(cardA)
  const b = getPartnerInfo(cardB)

  if (a && a.kind === 'choose-background') return (cardB.type || '').includes('Background')
  if (b && b.kind === 'choose-background') return (cardA.type || '').includes('Background')
  if (a && a.kind === 'doctors-companion') return /— Time Lord Doctor$/.test(cardB.type || '')
  if (b && b.kind === 'doctors-companion') return /— Time Lord Doctor$/.test(cardA.type || '')

  if (!a || !b) return false

  if (a.kind === 'tagged' && b.kind === 'tagged') return a.group === b.group
  if (a.kind === 'partner-with') return cardB.name === a.target
  if (b.kind === 'partner-with') return cardA.name === b.target

  return false
}

module.exports = { getPartnerInfo, arePartners }