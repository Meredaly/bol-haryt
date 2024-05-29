import { request } from './generic.api'

export const GET_PAYMENT_METHODS = ({ params }) => request({ url: `/api/order/payment`, params, method: 'GET' })

export const ADD_PAYMENT_METHOD = (data) => request({ url: `/api/order/payment/`, data, method: 'POST' })

export const EDIT_PAYMENT_METHOD = ({ id, data }) => request({ url: `/api/order/payment/${id}`, data, method: 'PUT' })

export const DELETE_PAYMENT_METHOD = (data) => request({ url: `/api/order/payment/${data.id}`, method: 'DELETE' })
