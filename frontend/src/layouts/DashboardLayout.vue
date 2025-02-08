<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const sidebarOpen = ref(true)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Verificar acceso al dashboard
if (!authStore.canAccessDashboard) {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="h-full flex flex-col">
        <!-- Logo -->
        <div class="p-4 border-b">
          <img src="../assets/images/logo.png" alt="Logo" class="h-8">
        </div>

        <!-- Menú -->
        <nav class="flex-1 overflow-y-auto p-4">
          <router-link 
            to="/dashboard" 
            class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            active-class="bg-[#33c7d1] text-white"
          >
            <span>Dashboard</span>
          </router-link>

          <router-link 
            v-if="authStore.isAdmin"
            to="/dashboard/usuarios" 
            class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            active-class="bg-[#33c7d1] text-white"
          >
            <span>Usuarios</span>
          </router-link>

          <router-link 
            to="/dashboard/productos" 
            class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            active-class="bg-[#33c7d1] text-white"
          >
            <span>Productos</span>
          </router-link>

          <router-link 
            to="/dashboard/pedidos" 
            class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            active-class="bg-[#33c7d1] text-white"
          >
            <span>Pedidos</span>
          </router-link>
        </nav>

        <!-- Footer del sidebar -->
        <div class="p-4 border-t">
          <button 
            @click="handleLogout"
            class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>

    <!-- Contenido principal -->
    <div :class="['flex-1', sidebarOpen ? 'ml-64' : 'ml-0']">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="flex items-center justify-between px-4 py-3">
          <button 
            @click="toggleSidebar"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div class="flex items-center">
            <span class="text-sm text-gray-700">{{ authStore.user?.nombre }}</span>
          </div>
        </div>
      </header>

      <!-- Contenido de la página -->
      <main class="p-6">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template> 