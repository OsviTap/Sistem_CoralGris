import { defineStore } from 'pinia'
import axios from '../utils/axios'

export const useMarcaStore = defineStore('marca', {
  state: () => ({
    marcas: [],
    loading: false,
    error: null
  }),

  getters: {
    // Organizar marcas en 4 columnas por rango alfabético
    marcasPorColumna: (state) => {
      const marcasOrdenadas = [...state.marcas].sort((a, b) => 
        a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
      );

      const columnas = {
        columna1: [], // A-C
        columna2: [], // D-L
        columna3: [], // M-P
        columna4: []  // R-Z
      };

      marcasOrdenadas.forEach(marca => {
        const primeraLetra = marca.nombre.charAt(0).toUpperCase();
        
        if (primeraLetra >= 'A' && primeraLetra <= 'C') {
          columnas.columna1.push(marca);
        } else if (primeraLetra >= 'D' && primeraLetra <= 'L') {
          columnas.columna2.push(marca);
        } else if (primeraLetra >= 'M' && primeraLetra <= 'P') {
          columnas.columna3.push(marca);
        } else {
          columnas.columna4.push(marca);
        }
      });

      return columnas;
    }
  },

  actions: {
    async fetchMarcas() {
      this.loading = true;
      try {
        const response = await axios.get('/marcas');
        this.marcas = response.data;
        this.error = null;
      } catch (error) {
        this.error = error.message || 'Error al cargar marcas';
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}); 