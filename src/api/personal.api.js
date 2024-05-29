import { request } from './generic.api'

export const GET_PERSONALS = ({ params }) => request({ url: `/api/manager/`, params, method: 'GET' })

export const ADD_PERSONAL = (data) => request({ url: `/api/manager/`, data, method: 'POST' })

export const EDIT_PERSONAL = ({ id, data }) => request({ url: `/api/manager/${id}`, data, method: 'PUT' })

export const DELETE_PERSONAL = ({ id }) => request({ url: `/api/manager/${id}`, method: 'DELETE' })
