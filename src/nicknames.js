const NickFile = require('../data/nicknames.json');

function resolveNickname(input) {
  const lowerInput = input.toLowerCase();
  const result = NickFile[lowerInput];
  if (!result) return null; // Nickname not found
  if (typeof result !== 'string') return NickFile[result];
  return result;
}

module.exports = { resolveNickname };