import { request } from './generic.api'

export const GET_ROOMS = ({ params = {} }) => request({ url: `/api/message/`, params, method: 'GET' })

export const GET_ROOM_MESSAGES = ({ params }) => request({ url: `/api/message/`, params, method: 'GET' })

export const SEND_MESSAGE = ({ data }) => request({ url: '/api/message/', data, method: 'POST' })
