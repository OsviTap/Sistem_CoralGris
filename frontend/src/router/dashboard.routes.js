import { defineAsyncComponent } from 'vue'

export const dashboardRoutes = {
  path: '/dashboard',
  component: () => import('../layouts/DashboardLayout.vue'),
  meta: { requiresAuth: true },
  children: [
    {
      path: '',
      name: 'Dashboard',
      component: () => import('../views/dashboard/DashboardHome.vue')
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
      path: 'productos/promociones',
      name: 'GestionPromociones',
      component: () => import('@/views/dashboard/productos/GestionPromociones.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: 'productos/interes',
      name: 'productos-interes',
      component: () => import('@/views/dashboard/productos/ProductosInteres.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
        title: 'Productos con Interés'
      }
    },
    {
      path: 'gestion-productos',
      name: 'GestionProductos',
      component: () => import('@/views/dashboard/GestionProductos.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
        title: 'Gestión de Productos'
      }
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
      name: 'UsuariosLista',
      component: () => import('../views/dashboard/usuarios/UsuariosLista.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: 'usuarios/crear',
      name: 'CrearUsuario',
      component: () => import('../views/dashboard/usuarios/CrearUsuario.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: 'usuarios/:id/editar',
      name: 'EditarUsuario',
      component: () => import('../views/dashboard/usuarios/EditarUsuario.vue'),
      meta: { requiresAdmin: true }
    }
  ]
} 