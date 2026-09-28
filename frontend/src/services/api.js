import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 5000 })
export const checkApiHealth = async () => (await api.get('/health')).data
export default api
