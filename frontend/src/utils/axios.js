import axios from 'axios'

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

export default instance 