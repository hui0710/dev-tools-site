import { createRouter, createWebHistory } from 'vue-router'
import { tools } from '../config/tools'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
      meta: { title: '开发者在线工具集合 - 免费前端开发工具', description: '一站式前端/开发者在线工具集合' },
    },
    ...tools.map((tool) => ({
      path: tool.path,
      name: tool.path.slice(1),
      component: tool.component,
      meta: { title: `${tool.name} - 开发者在线工具`, description: tool.description },
    })),
  ],
})

router.beforeEach((to) => {
  const title = (to.meta.title as string) || '开发者在线工具集合'
  const desc = (to.meta.description as string) || ''
  document.title = title
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) metaDesc.setAttribute('content', desc)
})

export default router
