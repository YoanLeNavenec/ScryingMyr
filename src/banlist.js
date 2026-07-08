const banlists = require('../data/banlists.json');

function isBanned(cardName, format, category = 'banned') {
  const formatData = banlists[format];
  if (!formatData) return false; // Format not found
  const bannedList = formatData[category];
  if (!bannedList) return false; // Category not found
  return bannedList.includes(cardName);
}

module.exports = { isBanned };