import { request } from './generic.api'

export const GET_BANNERS = ({ params }) => request({ url: `/api/marketing/banner/`, params, method: 'GET' })

export const ADD_BANNER = (data) => request({ url: `/api/marketing/banner/`, data, method: 'POST', file: true })

export const EDIT_BANNER = ({ id, data }) => request({ url: `/api/marketing/banner/${id}`, data, method: 'PUT', file: true })

export const DELETE_BANNER = (data) => request({ url: `/api/marketing/banner/${data.id}`, method: 'DELETE' })

export const EDIT_BANNER_POSITIONS = ({ data }) => request({ url: `/api/marketing/banner/order/`, data, method: 'POST' })
