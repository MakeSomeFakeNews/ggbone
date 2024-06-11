import WxRequest from "mina-request"
import {
  getStorage
} from "../utils/storage"
import {
  env
} from "../env"

const instance = new WxRequest({
  baseURL: env.baseURL,
  timeout: 6000,
  isLoading: true
})
// 请求拦截器
instance.interceptors.request = (config) => {
  const token = getStorage("token");
  if (token) {
    config.header['token'] = token;
  }
  return config
}

// 响应拦截器
instance.interceptors.response = (response) => {
  const {
    status,
  } = response.data
  switch (status) {
    case 200:
      return response.data
    default:
      return Promise.reject(response.data)
  }
}

export default instance