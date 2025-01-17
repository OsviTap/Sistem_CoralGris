import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/landing/LandingPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingPage
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
