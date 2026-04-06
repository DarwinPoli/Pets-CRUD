import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export const graphqlApi = axios.create({
  baseURL: `${API_BASE_URL}/graphql`,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getApiMode = (): 'REST' | 'GRAPHQL' => {
  return localStorage.getItem('apiMode') === 'GRAPHQL' ? 'GRAPHQL' : 'REST'
}

export const toggleApiMode = () => {
  const current = getApiMode()
  const next = current === 'REST' ? 'GRAPHQL' : 'REST'
  localStorage.setItem('apiMode', next)
  window.location.reload()
}
