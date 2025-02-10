<script setup>
import { ref } from 'vue'
import { useProductoStore } from '@/stores/producto'
import { useCategoriaStore } from '@/stores/categoria'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import Swal from 'sweetalert2'

const productoStore = useProductoStore()
const categoriaStore = useCategoriaStore()

const promocion = ref({
  activa: false,
  fechaInicio: '',
  fechaFin: '',
  tipo: 'porcentaje',
  valor: 0,
  categorias_aplicables: [],
  productos_aplicables: [],
  descripcion: ''
})

const guardarPromocion = async () => {
  try {
    await productoStore.configurarPromocion(promocion.value)
    await Swal.fire({
      title: '¡Promoción configurada!',
      text: 'La promoción se ha configurado correctamente',
      icon: 'success'
    })
  } catch (error) {
    await Swal.fire({
      title: 'Error',
      text: 'No se pudo configurar la promoción',
      icon: 'error'
    })
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-6">
    <h2 class="text-xl font-semibold mb-4">Gestión de Promociones</h2>
    
    <form @submit.prevent="guardarPromocion" class="space-y-6">
      <div class="grid grid-cols-2 gap-4">
        <BaseInput
          v-model="promocion.fechaInicio"
          type="datetime-local"
          label="Fecha de inicio"
        />
        <BaseInput
          v-model="promocion.fechaFin"
          type="datetime-local"
          label="Fecha de fin"
        />
      </div>

      <BaseSelect
        v-model="promocion.tipo"
        label="Tipo de descuento"
        :options="[
          { value: 'porcentaje', label: 'Porcentaje' },
          { value: 'monto_fijo', label: 'Monto fijo' }
        ]"
      />

      <BaseInput
        v-model.number="promocion.valor"
        type="number"
        :label="promocion.tipo === 'porcentaje' ? 'Porcentaje de descuento' : 'Monto de descuento'"
      />

      <!-- Resto del formulario para seleccionar categorías y productos -->
    </form>
  </div>
</template> 