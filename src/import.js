function importDeckList(text, format) {
    if (!text || text.trim() === '') return [];

  const lines = text.split(/\r?\n/)
  .filter(line => line.trim() !== '')
  .filter(line => line.match(/^\d/))
  .filter(line => {
    if (format === 'commander' || format === 'duelcommander' || format === 'cedh') {
      return !line.includes('`Sideboard`')}
      return true
  })
  

const deck = lines.map(line => {

  const cleanLine = line.replace(/(\d+)x/, '$1');
  const parts = cleanLine.split(' ', 2);
  const quantity = parseInt(parts[0]);
  const rawName = parts[1];

  const hasCommander = ['commander', 'duelcommander', 'cedh'].includes(format);
  const isCommander = hasCommander && rawName.includes('*CMDR*');
  const name = rawName.replace(/\s*[(`].*/, '').replace('*CMDR*','').trim();

  return { quantity, name, isCommander };
});

  return deck;
}

module.exports = { importDeckList };