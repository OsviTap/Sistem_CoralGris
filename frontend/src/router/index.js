import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/landing/LandingPage.vue'
import AboutUs from '@/views/about/AboutUs.vue'
import ContactUs from '@/views/contact/ContactUs.vue'

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
