import { ref } from 'vue'
import { GET_TAGS } from '@/api/tag.api'
import { updateCategoryForDropdown } from '@/helpers/normalize'

export function useTags(form) {
  const tags = ref([])
  const getTags = async (text = '') => {
    try {
      const { data } = await GET_TAGS({
        params: {
          page_size: 20,
          page: 1,
          search: text
        }
      })

      tags.value = data ? updateCategoryForDropdown(data) : []
    } catch (error) {
      console.error(error)
    }
  }

  const selectedTags = ref([])
  const selectTag = (tag) => {
    const findTag = selectedTags.value.findIndex((tagItem) => tagItem.id === tag.id)
    if (findTag >= 0) {
      selectedTags.value.splice(findTag, 1)
      form.value.tag.splice(findTag, 1)
    } else {
      selectedTags.value.push({
        id: tag.id,
        name: tag.name
      })
      form.value.tag.push(tag.id)
    }
  }
  return {
    tags,
    selectedTags,
    getTags,
    selectTag
  }
}
