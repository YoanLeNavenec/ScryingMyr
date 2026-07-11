function exportDeckList(deck) {
  if (!deck || deck.length === 0) return '';
  return (deck.map(card => card.quantity + ' ' + card.name)).join('\n');
}

module.exports = { exportDeckList };