import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 5000 })

api.interceptors.request.use((config) => {
	const token = sessionStorage.getItem('atelier-access-token')
	if (token) config.headers.Authorization = `Bearer ${token}`
	return config
})

api.interceptors.response.use((response) => response, (error) => {
	if (error.response?.status === 401 && error.config?.headers?.Authorization) {
		sessionStorage.removeItem('atelier-access-token')
		sessionStorage.removeItem('atelier-user')
		window.dispatchEvent(new Event('atelier:session-expired'))
	}
	return Promise.reject(error)
})

export const checkApiHealth = async () => (await api.get('/health')).data
export default api
