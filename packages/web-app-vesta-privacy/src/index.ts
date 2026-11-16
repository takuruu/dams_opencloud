import '@opencloud-eu/extension-sdk/tailwind.css'
import {
  AppMenuItemExtension,
  AppNavigationItem,
  defineWebApplication,
  useUserStore
} from '@opencloud-eu/web-pkg'
import { urlJoin } from '@opencloud-eu/web-client'
import { RouteRecordRaw } from 'vue-router'
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { appId, MODULES } from './types'
import DashboardView from './views/DashboardView.vue'
import ModuleView from './views/ModuleView.vue'

const moduleIcons: Record<string, string> = {
  company: 'building-2',
  records: 'shield-check',
  avv: 'file-shield-2',
  tom: 'lock-2',
  incidents: 'alarm-warning',
  dsr: 'user-settings',
  policies: 'file-text'
}

const dashboardModule = {
  id: 'dashboard',
  routeSlug: 'dashboard',
  title: 'Dashboard',
  icon: 'dashboard-3'
}

export default defineWebApplication({
  setup() {
    const { $gettext } = useGettext()
    const userStore = useUserStore()

    const appInfo = {
      id: appId,
      name: $gettext('Vesta Privacy'),
      icon: 'shield-check',
      color: '#04a07c'
    }

    const routes: RouteRecordRaw[] = [
      {
        path: '/',
        name: `${appId}-root`,
        redirect: `/${appId}/${dashboardModule.routeSlug}`
      },
      {
        path: `/${dashboardModule.routeSlug}`,
        name: `${appId}-${dashboardModule.id}`,
        component: DashboardView,
        meta: {
          authContext: 'user',
          title: $gettext(dashboardModule.title)
        }
      },
      ...MODULES.map((module) => ({
        path: `/${module.routeSlug}`,
        name: `${appId}-${module.id}`,
        component: ModuleView,
        meta: {
          authContext: 'user',
          title: $gettext(module.title)
        }
      }))
    ]

    const navItems: AppNavigationItem[] = [
      {
        name: $gettext(dashboardModule.title),
        icon: dashboardModule.icon,
        route: { path: urlJoin(appInfo.id, dashboardModule.routeSlug) },
        activeFor: [{ name: `${appId}-${dashboardModule.id}` }],
        priority: -1,
        isVisible: () => !!userStore.user
      },
      ...MODULES.map((module, index) => ({
        name: $gettext(module.title),
        icon: moduleIcons[module.id] || 'shield-check',
        route: { path: urlJoin(appInfo.id, module.routeSlug) },
        activeFor: [{ name: `${appId}-${module.id}` }],
        priority: index,
        isVisible: () => !!userStore.user
      }))
    ]

    const extensions = computed<AppMenuItemExtension[]>(() => {
      if (!userStore.user) {
        return []
      }
      return [
        {
          id: `app.${appInfo.id}.menuItem`,
          type: 'appMenuItem',
          label: () => appInfo.name,
          color: appInfo.color,
          icon: appInfo.icon,
          priority: 30,
          path: urlJoin(appInfo.id)
        }
      ]
    })

    return {
      appInfo,
      routes,
      navItems,
      extensions
    }
  }
})
