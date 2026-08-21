const banlists = require('../data/banlists.json');

function isBanned(cardName, format, category = 'banned') {
  const lookupFormat = format === 'cedh' ? 'commander' : format
  const formatData = banlists[lookupFormat];
  if (!formatData) return false;
  const bannedList = formatData[category];
  if (!bannedList) return false;
  return bannedList.includes(cardName);
}

function isOffensive(cardName) {
  return banlists.offensive.includes(cardName);
}

module.exports = { isBanned, isOffensive };