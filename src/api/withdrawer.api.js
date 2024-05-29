import { request } from './generic.api'

export const GET_WITHDRAWALS = ({ params }) => request({ url: `/api/withdrawal/`, params, method: 'GET' })

export const ADD_WITHDRAWER = ({ data }) => request({ url: `/api/withdrawal/`, data, method: 'POST' })

export const DELETE_WITHDRAWER = ({ id }) => request({ url: `/api/withdrawal/${id}`, method: 'DELETE' })
