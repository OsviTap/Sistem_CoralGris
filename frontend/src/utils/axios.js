import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3006/api', // Ajusta el puerto según tu configuración
  headers: {
    'Content-Type': 'application/json'
  }
})

export default axiosInstance 