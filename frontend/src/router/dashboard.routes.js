import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useAuthStore } from '@/stores/auth'

export const dashboardRoutes = {
  path: '/dashboard',
  component: DashboardLayout,
  meta: { requiresAuth: true },
  children: [
    {
      path: '',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/DashboardHome.vue'),
    },
    {
      path: 'productos',
      name: 'DashboardProductos',
      component: () => import('@/views/dashboard/productos/ProductosLista.vue'),
    },
    {
      path: 'productos/crear',
      name: 'CrearProducto',
      component: () => import('@/views/dashboard/productos/ProductoForm.vue'),
    },
    {
      path: 'productos/:id/editar',
      name: 'EditarProducto',
      component: () => import('@/views/dashboard/productos/ProductoForm.vue'),
      props: true
    },
    {
      path: 'pedidos',
      name: 'DashboardPedidos',
      component: () => import('@/views/dashboard/pedidos/PedidosLista.vue'),
    },
    {
      path: 'pedidos/:id',
      name: 'DetallePedido',
      component: () => import('@/views/dashboard/pedidos/PedidoDetalle.vue'),
      props: true
    },
    {
      path: 'usuarios',
      name: 'DashboardUsuarios',
      component: () => import('@/views/dashboard/usuarios/UsuariosLista.vue'),
      meta: { requiresAdmin: true }
    }
  ]
} 