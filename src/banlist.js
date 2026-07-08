const banlists = require('../data/banlists.json');

function isBanned(cardName, format, category = 'banned') {
  const formatData = banlists[format];
  const bannedList = formatData[category];
  return bannedList.includes(cardName);
}

module.exports = { isBanned };