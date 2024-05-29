import { onMounted, ref } from 'vue'

export function useDropdown() {
  const dropdownBody = ref(null)
  const dropdownMenu = ref(null)
  const showDropdown = ref(false)
  const showTop = ref(false)
  const openDropdown = () => {
    showDropdown.value = true
    setTimeout(() => {
      let bodyPosition = dropdownBody.value.getBoundingClientRect()
      let menuPosition = dropdownMenu.value.getBoundingClientRect()
      if (window.innerHeight - bodyPosition.y < menuPosition.height + 100) {
        showTop.value = true
      } else {
        showTop.value = false
      }
    }, 0)
  }
  const closeDropdown = () => {
    showDropdown.value = false
  }

  const dropdownToggle = (status) => {
    dropdownMenu.value && (dropdownMenu.value.style.height = status ? dropdownMenu.value.scrollHeight + 'px' : '')
  }

  return {
    dropdownBody,
    dropdownMenu,
    showDropdown,
    showTop,
    openDropdown,
    closeDropdown,
    dropdownToggle
  }
}
