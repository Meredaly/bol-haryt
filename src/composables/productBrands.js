import { ref } from 'vue'
import { GET_BRANDS } from '@/api/brand.api'

export function useBrands(form) {
  const brands = ref([])
  const getBrands = async (text = '') => {
    try {
      const { data } = await GET_BRANDS({
        params: {
          page_size: 20,
          page: 1,
          search: text
        }
      })

      brands.value = data || []
    } catch (error) {
      console.error(error)
    }
  }

  const selectedBrand = ref([])
  const selectBrand = (brand) => {
    selectedBrand.value = brand
    form.value.brand = brand.id
  }

  return {
    brands,
    selectedBrand,
    getBrands,
    selectBrand
  }
}
