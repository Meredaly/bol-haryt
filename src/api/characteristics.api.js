import { request } from './generic.api'

export const GET_CHARACTERISTICS = ({ params }) => request({ url: `/api/option/`, params, method: 'GET' })

export const GET_CHARACTERISTIC = (data) => request({ url: `/api/option/${data.id}`, method: 'GET' })

export const ADD_CHARACTERISTIC = (data) => request({ url: `/api/option/`, data, method: 'POST' })

export const EDIT_CHARACTERISTIC = ({ id, data }) => request({ url: `/api/option/${id}`, data, method: 'PUT' })

export const DELETE_CHARACTERISTIC = (data) => request({ url: `/api/option/${data.id}`, method: 'DELETE' })

export const ADD_OPTION = ({ data, characteristicId }) =>
  request({
    url: `/api/option/${characteristicId}`,
    data: {
      method: 'add',
      ...data
    },
    method: 'PUT'
  })

export const EDIT_OPTION = ({ data, characteristicId }) =>
  request({
    url: `/api/option/${characteristicId}`,
    data: {
      method: 'update',
      ...data
    },
    method: 'PUT'
  })

export const DELETE_OPTION = (data) =>
  request({
    url: `/api/option/${data.characteristicId}`,
    data: {
      method: 'delete',
      id: data.optionId
    },
    method: 'PUT'
  })

export const EDIT_CHARACTERISTIC_POSITIONS = ({ data }) => request({ url: `/api/option/order/`, data, method: 'POST' })

export const EDIT_SUB_CHARACTERISTIC_POSITIONS = ({ data }) =>
  request({ url: `/api/option/sub-option/order/`, data, method: 'POST' })
