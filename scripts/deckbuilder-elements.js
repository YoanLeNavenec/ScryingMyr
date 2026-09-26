// DOM element lookups and format constants shared across the deckbuilder scripts.
// Loaded FIRST in index.html — every other deckbuilder-*.js file relies on these
// existing already, since a couple of them wire up listeners immediately at load time.

const deckGrid = document.querySelector('.deck-grid')
const viewSelect = document.querySelector('.deck-view-select')
const formatSelector = document.querySelector('.deck-format-selector')
const groupSelector = document.querySelector('.deck-group')

const sortSelector = document.querySelector('.deck-sort')
const addCardBtn = document.querySelector('.deck-add-btn')
const addCardModal = document.getElementById('add-card-modal')
const cardImageModal = document.getElementById('card-image-modal') 
const cardSearchInput = document.getElementById('card-search-input')
const cardSearchResults = document.getElementById('card-search-results')

const singletonFormats = ['commander', 'cedh', 'duelcommander']
const deckSizeLimits = { commander: 100, cedh: 100, duelcommander: 100}
