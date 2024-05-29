import { request } from './generic.api'

export const AUTH = (data) => request({ url: `/api/seller/auth/login/`, data, method: 'POST' })

export const CHECK_SELLER_AUTH = () => request({ url: `/api/seller/auth/login/`, method: 'GET' })

export const REGISTRATION = ({ data }) => request({ url: '/api/seller/', data, method: 'POST', file: true })
