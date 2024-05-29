import { request } from './generic.api'

export const GET_ORDERS = ({ params }) => request({ url: `/api/order/`, params, method: 'GET' })

export const GET_SELLER_ORDERS = ({ params }) => request({ url: `/api/order/seller/`, params, method: 'GET' })

export const GET_ORDER = ({ id, params }) => request({ url: `/api/order/${id}`, params, method: 'GET' })

export const ADD_ORDER = (data) => request({ url: `/api/order/`, data, method: 'POST' })

export const EDIT_ORDER = ({ id, data }) => request({ url: `/api/order/${id}`, data, method: 'PUT' })

export const DELETE_ORDER = ({ id }) => request({ url: `/api/order/${id}`, method: 'DELETE' })
