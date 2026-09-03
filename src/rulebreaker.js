const rulebreakers = require('../data/rulebreakers.json');

function getRulebreakerRule(commanderName) {
    return rulebreakers[commanderName] || null;
}

module.exports = { getRulebreakerRule };