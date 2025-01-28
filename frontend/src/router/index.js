import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/landing/LandingPage.vue'
import AboutUs from '@/views/about/AboutUs.vue'
import ContactUs from '@/views/contact/ContactUs.vue'
import RegisterBusiness from '@/views/register/RegisterBusiness.vue'
import ProductosPage from '@/views/productos/ProductosPage.vue'

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

export default router
