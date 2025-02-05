import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/landing/LandingPage.vue'
import AboutUs from '@/views/about/AboutUs.vue'
import ContactUs from '@/views/contact/ContactUs.vue'
import RegisterBusiness from '@/views/register/RegisterBusiness.vue'
import ProductosPage from '@/views/productos/ProductosPage.vue'
import { useCartStore } from '@/stores/cart'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingPage
    },
    {
      path: '/nosotros',
      name: 'AboutUs',
      component: AboutUs
    },
    {
      path: '/contacto',
      name: 'ContactUs',
      component: ContactUs
    },
    {
      path: '/registrar-negocio',
      name: 'RegisterBusiness',
      component: RegisterBusiness,
      meta: {
        title: 'Registrar Negocio'
      }
    },
    {
      path: '/productos',
      name: 'Productos',
      component: ProductosPage,
      meta: {
        title: 'Productos'
      }
    },
    {
      path: '/productos/:id',
      name: 'ProductoDetalle',
      component: () => import('@/views/productos/ProductoDetalle.vue'),
      props: true
    },
    {
      path: '/cart',
      name: 'Cart',
      component: () => import('@/views/cart/CartView.vue')
    },
    {
      path: '/checkout',
      name: 'Checkout',
      component: () => import('@/views/checkout/CheckoutView.vue'),
      meta: { requiresCart: true }
    },
    {
      path: '/pedido-confirmado',
      name: 'OrderConfirmation',
      component: () => import('@/views/checkout/OrderConfirmation.vue')
    }
  ]
});

router.afterEach((to, from, failure) => {
  if (!failure) {
    setTimeout(() => {
      if (window.HSStaticMethods) {
        window.HSStaticMethods.autoInit();
      }
    }, 100)
  }
});

// Guardia de navegación para checkout
router.beforeEach((to, from, next) => {
  const cartStore = useCartStore()
  
  if (to.meta.requiresCart && cartStore.isEmpty) {
    next('/cart')
  } else {
    next()
  }
})

export default router
