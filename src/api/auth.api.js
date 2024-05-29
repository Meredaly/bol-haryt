import { request } from './generic.api'

export const AUTH = (data) => request({ url: `/api/manager/auth/`, data, method: 'POST' })

export const CHECK_AUTH = () => request({ url: `/api/manager/auth/`, method: 'GET' })
