import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '', // 기본은 same-origin
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청/응답 인터셉터(옵션)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.response?.data || err.message)
    return Promise.reject(err)
  }
)
