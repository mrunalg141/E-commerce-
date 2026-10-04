import api from './api'

export const registerAccount = async (details) => (await api.post('/auth/register', details)).data
export const signIn = async (credentials) => (await api.post('/auth/login', credentials)).data.data.user
export const getCurrentUser = async () => (await api.get('/auth/me')).data.data.user
export const signOut = async () => (await api.post('/auth/logout')).data