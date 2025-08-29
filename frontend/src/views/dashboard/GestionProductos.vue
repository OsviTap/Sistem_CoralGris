<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Gestión de Productos</h1>
      <p class="text-sm text-gray-600">Administra categorías, subcategorías y marcas del sistema</p>
    </div>

    <!-- Pestañas de navegación -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.id
              ? 'border-[#33c7d1] text-[#33c7d1]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <i :class="tab.icon + ' mr-2'"></i>
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Contenido de las pestañas -->
    <div class="space-y-6">
      <!-- Pestaña: Categorías -->
      <div v-if="activeTab === 'categorias'" class="space-y-6">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-info-circle text-blue-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">Información sobre Categorías</h3>
              <div class="mt-2 text-sm text-blue-700">
                <p>Las categorías son la clasificación principal de los productos. Solo se pueden eliminar si no tienen subcategorías asociadas.</p>
              </div>
            </div>
          </div>
        </div>
        
        <GestionCategorias />
      </div>

      <!-- Pestaña: Subcategorías -->
      <div v-if="activeTab === 'subcategorias'" class="space-y-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-info-circle text-green-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">Información sobre Subcategorías</h3>
              <div class="mt-2 text-sm text-green-700">
                <p>Las subcategorías son clasificaciones específicas dentro de una categoría. Solo se pueden eliminar si no tienen productos asociados.</p>
              </div>
            </div>
          </div>
        </div>
        
        <GestionSubcategorias />
      </div>

      <!-- Pestaña: Marcas -->
      <div v-if="activeTab === 'marcas'" class="space-y-6">
        <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-info-circle text-purple-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-purple-800">Información sobre Marcas</h3>
              <div class="mt-2 text-sm text-purple-700">
                <p>Las marcas representan los fabricantes o proveedores de los productos. Solo se pueden eliminar si no tienen productos asociados.</p>
              </div>
            </div>
          </div>
        </div>
        
        <GestionMarcas />
      </div>

      <!-- Pestaña: Resumen -->
      <div v-if="activeTab === 'resumen'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Tarjeta de Categorías -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="fas fa-tags text-3xl text-[#33c7d1]"></i>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Total Categorías
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ resumen.categorias }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <div class="text-sm">
                <a href="#" @click="activeTab = 'categorias'" class="font-medium text-[#33c7d1] hover:text-[#2ba3ac]">
                  Ver todas
                </a>
              </div>
            </div>
          </div>

          <!-- Tarjeta de Subcategorías -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="fas fa-layer-group text-3xl text-green-500"></i>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Total Subcategorías
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ resumen.subcategorias }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <div class="text-sm">
                <a href="#" @click="activeTab = 'subcategorias'" class="font-medium text-green-600 hover:text-green-500">
                  Ver todas
                </a>
              </div>
            </div>
          </div>

          <!-- Tarjeta de Marcas -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="fas fa-trademark text-3xl text-purple-500"></i>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Total Marcas
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ resumen.marcas }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <div class="text-sm">
                <a href="#" @click="activeTab = 'marcas'" class="font-medium text-purple-600 hover:text-purple-500">
                  Ver todas
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Estadísticas adicionales -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Estadísticas del Sistema</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="text-sm font-medium text-gray-500 mb-2">Distribución por Estado</h4>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Categorías Activas:</span>
                  <span class="font-medium text-green-600">{{ resumen.categoriasActivas }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Subcategorías Activas:</span>
                  <span class="font-medium text-green-600">{{ resumen.subcategoriasActivas }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Marcas Activas:</span>
                  <span class="font-medium text-green-600">{{ resumen.marcasActivas }}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-500 mb-2">Acciones Rápidas</h4>
              <div class="space-y-2">
                <button
                  @click="activeTab = 'categorias'"
                  class="w-full text-left px-3 py-2 text-sm text-[#33c7d1] hover:bg-[#33c7d1] hover:text-white rounded-md transition-colors"
                >
                  <i class="fas fa-plus mr-2"></i>
                  Agregar Nueva Categoría
                </button>
                <button
                  @click="activeTab = 'subcategorias'"
                  class="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-600 hover:text-white rounded-md transition-colors"
                >
                  <i class="fas fa-plus mr-2"></i>
                  Agregar Nueva Subcategoría
                </button>
                <button
                  @click="activeTab = 'marcas'"
                  class="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-600 hover:text-white rounded-md transition-colors"
                >
                  <i class="fas fa-plus mr-2"></i>
                  Agregar Nueva Marca
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCategoriaStore } from '@/stores/categoria'
import { useSubcategoriaStore } from '@/stores/subcategoria'
import { useMarcaStore } from '@/stores/marca'
import GestionCategorias from '@/components/dashboard/GestionCategorias.vue'
import GestionSubcategorias from '@/components/dashboard/GestionSubcategorias.vue'
import GestionMarcas from '@/components/dashboard/GestionMarcas.vue'

const categoriaStore = useCategoriaStore()
const subcategoriaStore = useSubcategoriaStore()
const marcaStore = useMarcaStore()

const activeTab = ref('resumen')

const tabs = [
  { id: 'resumen', name: 'Resumen', icon: 'fas fa-chart-bar' },
  { id: 'categorias', name: 'Categorías', icon: 'fas fa-tags' },
  { id: 'subcategorias', name: 'Subcategorías', icon: 'fas fa-layer-group' },
  { id: 'marcas', name: 'Marcas', icon: 'fas fa-trademark' }
]

const resumen = computed(() => {
  const categorias = categoriaStore.categorias
  const subcategorias = subcategoriaStore.subcategorias
  const marcas = marcaStore.marcas

  return {
    categorias: categorias.length,
    subcategorias: subcategorias.length,
    marcas: marcas.length,
    categoriasActivas: categorias.filter(c => c.estado === 'activo').length,
    subcategoriasActivas: subcategorias.filter(s => s.estado === 'activo').length,
    marcasActivas: marcas.filter(m => m.estado === 'activo').length
  }
})

onMounted(async () => {
  await Promise.all([
    categoriaStore.fetchCategorias(),
    subcategoriaStore.fetchSubcategorias(),
    marcaStore.fetchMarcas()
  ])
})
</script>
