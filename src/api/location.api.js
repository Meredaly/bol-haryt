import { request } from './generic.api'

export const GET_LOCATIONS = ({ params }) => request({ url: `/api/order/address/`, params, method: 'GET' })

export const GET_LOCATION = (data) => request({ url: `/api/order/address/${data.id}`, method: 'GET' })

export const ADD_LOCATION = (data) => request({ url: `/api/order/address/`, data, method: 'POST' })

export const EDIT_LOCATION = ({ id, data }) => request({ url: `/api/order/address/${id}`, data, method: 'PUT' })

export const DELETE_LOCATION = (data) => request({ url: `/api/order/address/${data.id}`, method: 'DELETE' })

export const EDIT_LOCATION_POSITIONS = ({ data }) => request({ url: `/api/order/address/order/`, data, method: 'POST' })
