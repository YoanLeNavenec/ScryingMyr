const GuildFile = require('../data/guilds.json');

function resolveGuild(input) {
  const lowerInput = input.toLowerCase();
  const GuildFind = Object.keys(GuildFile).find(cat => Object.values(GuildFile[cat]).some(entry => entry.aliases.includes(lowerInput)))
  if (!GuildFind) return null; // Guild doesnt exist
  const GuildEntry = Object.values(GuildFile[GuildFind]).find(entry => entry.aliases.includes(lowerInput));
  if (!GuildEntry) return null; // Guild doesnt exist still
  return GuildEntry.colors;
}

module.exports = { resolveGuild };