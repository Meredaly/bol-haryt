export function useValidators() {
  const email = (email) => {
    return !!email
      .toString()
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  }
  const phoneNumber = (phoneNumber) => {
    return !!phoneNumber
      .toString()
      .toLowerCase()
      .match(/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-s./0-9]*$/g)
  }

  const site = (site) => {
    return !!site
      .toString()
      .toLowerCase()
      .match(/^((ftp|http|https?):\/\/)([A-z]+)\.([A-z]{2,})/)
  }
  const required = (element) => {
    return !!element
  }

  const optional = (element) => {
    return !element
  }
  return { email, phoneNumber, required, optional, site }
}
