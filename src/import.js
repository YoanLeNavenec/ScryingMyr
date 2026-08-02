const companions = require('../data/companions.json');

function importDeckList(text, format) {
    if (!text || text.trim() === '') return [];

  const rawLines = text.split(/\r?\n/).filter(line => line.trim() !== '')
  const sideboardIndex = rawLines.findIndex(line => line.trim() === 'SIDEBOARD:')
  const mainLines = sideboardIndex === -1 ? rawLines : rawLines.slice(0, sideboardIndex)
  const sideboardLines = sideboardIndex === -1 ? [] : rawLines.slice(sideboardIndex + 1)

  function parseLines(lineList) {
    return lineList
      .filter(line => line.match(/^\d/))
      .map(line => {

  const cleanLine = line.replace(/(\d+)x/, '$1');
  const parts = cleanLine.split(' ');
  const quantity = parseInt(parts[0]);
  const rawName = parts.slice(1).join(' ');

  const hasCommander = ['commander', 'duelcommander', 'cedh'].includes(format);
  const isCommander = hasCommander && rawName.includes('*CMDR*');
  const name = rawName.replace(/\s*[(`].*/, '').replace('*CMDR*','').trim();

  return { quantity, name, isCommander};
  });
}

  const deck = parseLines(mainLines)
  const sideboard = parseLines(sideboardLines)

  const actualSideboard = sideboard.filter(card => companions[card.name])
  const commanderCandidates = sideboard.filter(card => !companions[card.name])

  return { deck: [...deck, ...commanderCandidates], sideboard: actualSideboard };
}

module.exports = { importDeckList };