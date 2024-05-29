import { request } from './generic.api'

export const DASHBOARD = (data) => request({ url: `/api/manager/dashboard`, data, method: 'GET' })
