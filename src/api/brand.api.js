import { request } from './generic.api'

export const GET_BRANDS = ({ params }) => request({ url: `/api/brand/`, params, method: 'GET' })

export const GET_BRAND = (data) => request({ url: `/api/brand/${data.id}`, method: 'GET' })

export const ADD_BRAND = (data) => request({ url: `/api/brand/`, data, method: 'POST', file: true })

export const EDIT_BRAND = ({ id, data }) => request({ url: `/api/brand/${id}`, data, method: 'PUT', file: true })

export const DELETE_BRAND = (data) => request({ url: `/api/brand/${data.id}`, method: 'DELETE' })

export const DELETE_BRANDS = (data) => request({ url: `/api/brand/`, data, method: 'DELETE' })
