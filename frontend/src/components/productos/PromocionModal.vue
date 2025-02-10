<script setup>
import { ref, computed } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseSearchSelect from '@/components/common/BaseSearchSelect.vue'
import { useProductoStore } from '@/stores/producto'
import { useCategoriaStore } from '@/stores/categoria'
import Swal from 'sweetalert2'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'promocion-guardada'])

const productoStore = useProductoStore()
const categoriaStore = useCategoriaStore()

const tipoAccion = ref('promocion') // 'promocion' o 'descuento'
const tipoDescuento = ref('porcentaje') // 'porcentaje', 'monto_fijo', 'manual'
const productosSeleccionados = ref([])
const preciosManual = ref({})

const promocion = ref({
  tipo: 'promocion',
  valor: 0,
  fechaInicio: '',
  fechaFin: '',
  descripcion: '',
  productos: [],
  precioPromocion: 0,
  descuentos: {
    tipo: 'porcentaje',
    valor: 0,
    precios: {
      l1: 0,
      l2: 0,
      l3: 0,
      l4: 0
    }
  }
})

const buscarProductos = async (query) => {
  // Implementar búsqueda de productos
  return productoStore.searchProductos(query)
}

const handleProductoSelect = (producto) => {
  if (!productosSeleccionados.value.find(p => p.id === producto.id)) {
    productosSeleccionados.value.push(producto)
    // Inicializar precios manuales para este producto
    preciosManual.value[producto.id] = {
      l1: producto.precio_l1,
      l2: producto.precio_l2,
      l3: producto.precio_l3,
      l4: producto.precio_l4
    }
  }
}

const guardarPromocion = async () => {
  try {
    const datosGuardar = {
      ...promocion.value,
      tipo: tipoAccion.value,
      productos: productosSeleccionados.value.map(p => p.id),
      descuentos: tipoDescuento.value === 'manual' ? preciosManual.value : {
        tipo: tipoDescuento.value,
        valor: promocion.value.valor
      }
    }
    
    await productoStore.configurarPromocion(datosGuardar)
    emit('close')
    emit('promocion-guardada')
    await Swal.fire({
      title: '¡Configuración guardada!',
      text: `${tipoAccion.value === 'promocion' ? 'Promoción' : 'Descuento'} configurado correctamente`,
      icon: 'success'
    })
  } catch (error) {
    await Swal.fire({
      title: 'Error',
      text: 'No se pudo guardar la configuración',
      icon: 'error'
    })
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Configurar {{ tipoAccion === 'promocion' ? 'Promoción' : 'Descuento' }}</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="guardarPromocion" class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <BaseSelect
            v-model="tipoAccion"
            label="Tipo de acción"
            :options="[
              { value: 'promocion', label: 'Promoción' },
              { value: 'descuento', label: 'Descuento' }
            ]"
          />
          
          <BaseSelect
            v-if="tipoAccion === 'descuento'"
            v-model="tipoDescuento"
            label="Tipo de descuento"
            :options="[
              { value: 'porcentaje', label: 'Porcentaje general' },
              { value: 'monto_fijo', label: 'Monto fijo general' },
              { value: 'manual', label: 'Manual por nivel' }
            ]"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <BaseInput
            v-model="promocion.fechaInicio"
            type="datetime-local"
            label="Fecha de inicio"
            required
          />
          <BaseInput
            v-model="promocion.fechaFin"
            type="datetime-local"
            label="Fecha de fin"
            required
          />
        </div>

        <BaseSearchSelect
          label="Buscar y seleccionar productos"
          :search-function="buscarProductos"
          @select="handleProductoSelect"
        />

        <div class="mt-4">
          <h3 class="font-medium mb-2">Productos seleccionados:</h3>
          <div class="space-y-2">
            <div v-for="producto in productosSeleccionados" :key="producto.id" 
                 class="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{{ producto.nombre }}</span>
              <button @click="productosSeleccionados = productosSeleccionados.filter(p => p.id !== producto.id)"
                      class="text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Campos específicos según el tipo de acción -->
        <div v-if="tipoAccion === 'promocion'" class="mt-4">
          <BaseInput
            v-model.number="promocion.precioPromocion"
            type="number"
            label="Precio promocional del conjunto"
            required
          />
        </div>

        <div v-else class="mt-4">
          <template v-if="tipoDescuento !== 'manual'">
            <BaseInput
              v-model.number="promocion.valor"
              type="number"
              :label="tipoDescuento === 'porcentaje' ? 'Porcentaje de descuento' : 'Monto de descuento'"
              required
            />
          </template>
          
          <template v-else>
            <div v-for="producto in productosSeleccionados" :key="producto.id" class="mb-4">
              <h4 class="font-medium mb-2">{{ producto.nombre }}</h4>
              <div class="grid grid-cols-4 gap-4">
                <BaseInput
                  v-model.number="preciosManual[producto.id].l1"
                  type="number"
                  label="Precio L1"
                />
                <BaseInput
                  v-model.number="preciosManual[producto.id].l2"
                  type="number"
                  label="Precio L2"
                />
                <BaseInput
                  v-model.number="preciosManual[producto.id].l3"
                  type="number"
                  label="Precio L3"
                />
                <BaseInput
                  v-model.number="preciosManual[producto.id].l4"
                  type="number"
                  label="Precio L4"
                />
              </div>
            </div>
          </template>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-[#33c7d1] text-white rounded-md hover:bg-[#2ba3ac]"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 