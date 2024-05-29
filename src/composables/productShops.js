import { ref } from 'vue'
import { GET_SHOPS } from '@/api/shop.api'

export function useShops(form) {
  const shops = ref([])
  const getShops = async (search = '') => {
    try {
      const { data } = await GET_SHOPS({
        params: {
          limit: 20,
          page: 1,
          search: search
        }
      })

      shops.value =
        data?.map((shop) => ({
          ...shop,
          name: shop.market_name
        })) || []
    } catch (error) {
      console.error(error)
    }
  }

  const selectedShop = ref([])
  const selectShop = (shop) => {
    selectedShop.value = shop
    form.value.seller = shop.id
  }

  return {
    shops,
    selectedShop,
    getShops,
    selectShop
  }
}
