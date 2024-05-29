import { request } from './generic.api'

export const GET_NOTIFICATIONS = () => request({ url: `/api/manager/natification`, method: 'GET' })
