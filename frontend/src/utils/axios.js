import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const instance = axios.create({
  baseURL: 'http://localhost:3006/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Agregar el token a todas las peticiones si existe
const token = localStorage.getItem('token')
if (token) {
  instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Interceptor para manejar errores
instance.interceptors.response.use(
  response => response,
  async error => {
    console.error('Error en la petición:', error)
    
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      await authStore.logout()
    }
    
    return Promise.reject(error)
  }
)

// Interceptor para agregar logs a las peticiones
instance.interceptors.request.use(
  config => {
    console.log(`Petición a ${config.url}:`, config)
    return config
  },
  error => {
    console.error('Error en la petición:', error)
    return Promise.reject(error)
  }
)

export default instance 