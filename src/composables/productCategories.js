import { ref } from 'vue'
import { GET_CATEGORIES } from '@/api/category.api'
import { updateCategoryForDropdown } from '@/helpers/normalize'
import { useI18n } from 'vue-i18n'

export function useCategories(form) {
  const mainCategories = ref([])
  const categories = ref([])
  const { locale } = useI18n()

  const getMainCategories = async () => {
    try {
      const { data } = await GET_CATEGORIES({
        params: { lang: 'all' }
      })

      mainCategories.value = data ? updateCategoryForDropdown(data, '', locale.value) : []

      categories.value = JSON.parse(JSON.stringify(mainCategories.value))
    } catch (error) {
      console.error(error)
    }
  }

  const getCategories = async (text = '') => {
    const searchedCategories = []

    mainCategories.value.forEach((category) => {
      const findCategories = findCategory(category.sub, text)

      if (findCategories) {
        searchedCategories.push(...findCategories)
      }

      if (category.nameOld.toLowerCase().includes(text.toLowerCase())) {
        searchedCategories.push({
          id: category.id,
          name: category.name,
          nameOld: category.nameOld,
          sub: null
        })
      }
    })

    categories.value = text ? searchedCategories : JSON.parse(JSON.stringify(mainCategories.value))
  }

  const findCategory = (categories = [], text = '') => {
    const searchedCategories = []

    categories?.forEach((category) => {
      const finedCategories = findCategory(category.sub, text)

      if (finedCategories) {
        searchedCategories.push(...finedCategories)
      }

      if (category.nameOld.toLowerCase().includes(text.toLowerCase())) {
        searchedCategories.push({
          id: category.id,
          name: category.name,
          nameOld: category.nameOld,
          sub: null
        })
      }
    })

    return searchedCategories
  }

  const selectedCategories = ref([])

  const addParent = (category) => {
    const isParent = mainCategories.value?.some((childCategory) => childCategory.id === category.id) || false
    if (isParent) {
      return null
    }
    mainCategories.value.forEach((childCategory) => {
      findParent(childCategory, category)
    })
  }

  const findParent = (category, selectedCategory) => {
    let isChild = false

    if (category.sub?.length) {
      isChild = category.sub?.some((childCategory) => {
        const isChild = findParent(childCategory, selectedCategory)
        if (isChild) {
          const findCategory = selectedCategories.value.some((categoryItem) => categoryItem.id === category.id)

          if (!findCategory) {
            selectedCategories.value.push(JSON.parse(JSON.stringify(category)))
            form.value.category.push(category.id)
          }
          return true
        }
      })
    }

    const isParent = category.sub?.some((childCategory) => childCategory.id === selectedCategory.id) || false

    if (isParent) {
      const findCategory = selectedCategories.value.some((categoryItem) => categoryItem.id === category.id)
      if (!findCategory) {
        selectedCategories.value.push(JSON.parse(JSON.stringify(category)))
        form.value.category.push(category.id)
      }
      return true
    }

    return isChild
  }

  const findSelectedCategory = (category, categories) => {
    let findCat = null
    categories?.forEach((cat) => {
      if (cat.sub) {
        const findSub = findSelectedCategory(category, cat.sub)
        if (findSub) {
          findCat = findSub
        }
      }
      if (cat.id === category.id) {
        findCat = cat
      }
    })
    return JSON.parse(JSON.stringify(findCat))
  }

  const selectCategory = (category) => {
    const findSelectedCategoryIndex = selectedCategories.value.findIndex(
      (categoryItem) => categoryItem.id === category.id
    )
    if (findSelectedCategoryIndex >= 0) {
      selectedCategories.value.splice(findSelectedCategoryIndex, 1)
      if (form?.value) {
        form.value.category.splice(findSelectedCategoryIndex, 1)
      }
    } else {
      const findCategory = findSelectedCategory(category, mainCategories.value)

      addParent(findCategory)
      selectedCategories.value.push(JSON.parse(JSON.stringify(findCategory)))
      if (form?.value) {
        form.value.category.push(category.id)
      }
      return findCategory
    }
  }

  return {
    categories,
    selectedCategories,
    getCategories,
    getMainCategories,
    selectCategory,
    findSelectedCategory
  }
}
