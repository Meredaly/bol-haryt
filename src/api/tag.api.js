import { request } from './generic.api'

export const GET_TAGS = ({ params }) => request({ url: `/api/tag/?lang=all`, params, method: 'GET' })

export const GET_TAG = (data) => request({ url: `/api/tag/${data.id}?lang=all`, method: 'GET' })

export const ADD_TAG = (data) => request({ url: `/api/tag/`, data, method: 'POST' })

export const EDIT_TAG = ({ id, data }) => request({ url: `/api/tag/${id}`, data, method: 'PUT' })

export const DELETE_TAG = (data) => request({ url: `/api/tag/${data.id}`, method: 'DELETE' })

export const DELETE_TAGS = (data) => request({ url: `/api/tag/`, data, method: 'DELETE' })
