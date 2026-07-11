const banlists = require('../data/banlists.json');
const lookupFormat = format === 'cedh' ? 'commander' : format;
const formatData = banlists[lookupFormat];

function isBanned(cardName, format, category = 'banned') {
  const formatData = banlists[format];
  if (!formatData) return false; // Format not found
  const bannedList = formatData[category];
  if (!bannedList) return false; // Category not found
  return bannedList.includes(cardName);
}

module.exports = { isBanned };