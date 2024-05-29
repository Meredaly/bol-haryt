import { request } from './generic.api'

export const GET_COMMENTS = ({ params }) => request({ url: `/api/comment/`, params, method: 'GET' })

export const GET_COMMENT = (data) => request({ url: `/api/comment/${data.id}`, method: 'GET' })

export const EDIT_COMMENT = ({ id, data }) => request({ url: `/api/comment/${id}`, data, method: 'PUT' })

export const ADD_REPLY_COMMENT = (data) => request({ url: `/api/comment/`, data, method: 'POST' })

export const EDIT_REPLY_COMMENT = ({ id, data }) => request({ url: `/api/comment/${id}`, data, method: 'PUT' })

export const DELETE_COMMENT = (data) => request({ url: `/api/comment/${data.id}`, method: 'DELETE' })
