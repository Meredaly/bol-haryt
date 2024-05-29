import { request } from './generic.api'

export const GET_SHOPS = ({ params }) => request({ url: `/api/seller/?lang=all`, params, method: 'GET' })

export const GET_SHOP = (data) => request({ url: `/api/seller/${data.id}?lang=all`, method: 'GET' })

export const ADD_SHOP = (data) => request({ url: `/api/seller/`, data, method: 'POST', file: true })

export const EDIT_SHOP = ({ id, data }) => request({ url: `/api/seller/${id}`, data, method: 'PUT', file: true })

export const DELETE_SHOP = (data) => request({ url: `/api/seller/${data.id}`, method: 'DELETE' })

export const DELETE_SHOPS = (data) => request({ url: `/api/seller/`, data, method: 'DELETE' })
