import { request } from './generic.api'

export const GET_USERS = ({ params }) => request({ url: `/api/client/`, params, method: 'GET' })

export const GET_USER = (data) => request({ url: `/api/client/${data.id}`, method: 'GET' })

export const ADD_USER = (data) => request({ url: `/api/client/`, data, method: 'POST' })

export const EDIT_USER = ({ id, data }) => request({ url: `/api/client/${id}/`, data, method: 'PUT' })

export const DELETE_USER = (data) => request({ url: `/api/client/${data.id}`, method: 'DELETE' })
