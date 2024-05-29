import { request } from './generic.api'

export const GET_CATEGORIES = ({ params }) => request({ url: `/api/category/`, params, method: 'GET' })

export const GET_CATEGORY = (data) => request({ url: `/api/category/${data.id}?lang=all`, method: 'GET' })

export const ADD_CATEGORY = (data) => request({ url: `/api/category/`, data, method: 'POST', file: true })

export const EDIT_CATEGORY = ({ id, data }) => request({ url: `/api/category/${id}`, data, method: 'PUT', file: true })

export const DELETE_CATEGORY = (data) => request({ url: `/api/category/${data.id}`, method: 'DELETE' })

export const DELETE_CATEGORIES = (data) => request({ url: `/api/category/`, data, method: 'DELETE' })

export const EDIT_CATEGORY_POSITIONS = ({ data }) => request({ url: `/api/category/order/`, data, method: 'POST' })
