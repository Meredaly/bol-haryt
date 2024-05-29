import { request } from './generic.api'

export const GET_SHIPPINGS = ({ params }) => request({ url: `/api/order/shipping/?lang=all`, params, method: 'GET' })

export const GET_SHIPPING = (data) => request({ url: `/api/order/shipping/${data.id}`, method: 'GET' })

export const ADD_SHIPPING = (data) => request({ url: `/api/order/shipping/`, data, method: 'POST' })

export const EDIT_SHIPPING = ({ id, data }) => request({ url: `/api/order/shipping/${id}`, data, method: 'PUT' })

export const DELETE_SHIPPING = (data) => request({ url: `/api/order/shipping/${data.id}`, method: 'DELETE' })
