import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const predictRisk = async (studentData) => {
  const { data } = await api.post('/api/predict', studentData)
  return data
}

export const adminLogin = async (email, password) => {
  const { data } = await api.post('/api/admin/login', { email, password })
  return data
}

export const getOverview = async (token) => {
  const { data } = await api.get('/api/admin/overview', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export const getStudents = async (token, page = 1, riskFilter = null) => {
  const params = { page, page_size: 50 }
  if (riskFilter) params.risk_filter = riskFilter
  const { data } = await api.get('/api/admin/students', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  })
  return data
}

export const exportCSV = async (token) => {
  const response = await api.get('/api/admin/export', {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'acadai_submissions.csv')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export default api
