const importInput = document.querySelector('.import-input')
const importBtn = document.querySelector('.import-btn')
const formatSelect = document.querySelector('.format-selector')
const exportOutput = document.querySelector('.export-output')
const exportBtns = document.querySelectorAll('.export-btn')

window.currentDeck = []

importBtn.addEventListener('click', function(){
  const text = importInput.value 
  const format = formatSelect.value 
  const result = window.electronAPI.importDeck(text, format)
  if (result && result.length > 0) {
    window.currentDeck = result
  }
  console.log(result)
})

exportBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!window.currentDeck || window.currentDeck.length === 0) return
    exportOutput.value = window.electronAPI.exportDeck(window.currentDeck)
  })
})