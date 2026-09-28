import api from './api'

export const registerAccount = async (details) => (await api.post('/auth/register', details)).data.data
export const signIn = async (credentials) => (await api.post('/auth/login', credentials)).data.data
export const getCurrentUser = async () => (await api.get('/auth/me')).data.data.user