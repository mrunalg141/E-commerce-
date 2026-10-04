import axios from 'axios'

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
	timeout: 5000,
	withCredentials: true,
})

let refreshRequest = null

api.interceptors.response.use((response) => response, async (error) => {
	const request = error.config
	const requestUrl = request?.url || ''
	if (error.response?.status !== 401 || !request) return Promise.reject(error)
	if (requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register') || requestUrl.includes('/auth/logout')) {
		return Promise.reject(error)
	}
	if (requestUrl.includes('/auth/refresh')) {
		if (error.response?.data?.message !== 'No active refresh session.') {
			window.dispatchEvent(new Event('atelier:session-expired'))
		}
		return Promise.reject(error)
	}
	if (request._retry) {
		window.dispatchEvent(new Event('atelier:session-expired'))
		return Promise.reject(error)
	}

	request._retry = true
	refreshRequest ||= api.post('/auth/refresh').finally(() => { refreshRequest = null })
	try {
		await refreshRequest
		return api(request)
	} catch (refreshError) {
		if (refreshError.response?.data?.message !== 'No active refresh session.') {
			window.dispatchEvent(new Event('atelier:session-expired'))
		}
		return Promise.reject(refreshError)
	}
})

export const checkApiHealth = async () => (await api.get('/health')).data
export default api
