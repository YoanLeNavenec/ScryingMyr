function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast')
  const toastMsg = document.getElementById('toast-message')
  toastMsg.textContent = message
  toast.classList.remove('hidden')
  setTimeout(() => {
    toast.classList.add('hidden')
  }, duration)
}