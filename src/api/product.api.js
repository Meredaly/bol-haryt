import { request } from './generic.api'

export const GET_PRODUCTS = (params) => request({ url: `/api/product/`, params, method: 'GET' })

export const GET_PRODUCT = (data) => request({ url: `/api/product/${data.id}?lang=all`, method: 'GET' })

export const SAVE_PRODUCT = (data) => request({ url: `/api/product/`, data, method: 'POST' })

export const EDIT_PRODUCT = ({ id, data }) => request({ url: `/api/product/${id}`, data, method: 'PUT' })

export const DELETE_PRODUCT = (data) => request({ url: `/api/product/${data.id}`, method: 'DELETE' })

export const ADD_IMAGES = (data) => request({ url: '/api/image/', data, method: 'POST' })

export const DELETE_IMAGE = (data) => request({ url: `/api/image/${data.id}`, method: 'DELETE' })

export const ADD_VIDEO = ({ id, data, onUploadProgress }) => request({ url: `/api/product/${id}`, data, onUploadProgress, method: 'PUT', file: true })

export const GET_PRODUCT_VARIANT = ({ id }) => request({ url: `/api/variant/${id}`, method: 'GET' })

export const EDIT_PRODUCT_VARIANT = ({ id, data }) => request({ url: `/api/variant/${id}`, data, method: 'PUT' })
