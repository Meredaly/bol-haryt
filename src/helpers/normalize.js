export const updateCategoryForDropdown = (categoryItems, parentName = '', lang = 'ru') => {
  return (
    categoryItems?.map((category) => {
      let sub = null

      if (category.child) sub = updateCategoryForDropdown(category.child, parentName + category.name[lang] + '/', lang)

      return {
        ...category,
        id: category.id,
        name: parentName + category.name[lang],
        nameOld: category.name[lang],
        sub: sub
      }
    }) || null
  )
}

export const createDate = () => {
  const date = new Date()
  const year = date.getFullYear().toString().padStart(4, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const normalizePhone = (number) => {
  const partOne = number?.slice(0, 6) || ''
  const partTwo = number?.slice(6, 8) || ''
  const partThree = number?.slice(8, 10) || ''
  const partFour = number?.slice(10, 12) || ''
  return `${partOne} ${partTwo} ${partThree} ${partFour}`
}
