import '@opencloud-eu/extension-sdk/tailwind.css'
import {
  AppMenuItemExtension,
  AppNavigationItem,
  AppWrapperRoute,
  defineWebApplication,
  useUserStore
} from '@opencloud-eu/web-pkg'
import { urlJoin } from '@opencloud-eu/web-client'
import { RouteRecordRaw } from 'vue-router'
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { appId } from './types'
import ProcessorsView from './views/ProcessorsView.vue'
import RecordsView from './views/RecordsView.vue'

export default defineWebApplication({
  setup() {
    const { $gettext } = useGettext()
    const userStore = useUserStore()

    const appInfo = {
      id: appId,
      name: $gettext('Datenschutz'),
      icon: 'shield-check',
      color: '#04a07c'
    }

    const routes: RouteRecordRaw[] = [
      {
        path: '/',
        name: `${appId}-root`,
        redirect: `/${appId}/records`
      },
      {
        path: '/records',
        name: `${appId}-records`,
        component: AppWrapperRoute(RecordsView, { applicationId: appId }),
        meta: {
          authContext: 'user',
          title: $gettext('Verfahrensverzeichnis')
        }
      },
      {
        path: '/avv',
        name: `${appId}-avv`,
        component: AppWrapperRoute(ProcessorsView, { applicationId: appId }),
        meta: {
          authContext: 'user',
          title: $gettext('Auftragsverarbeiter & AVV')
        }
      }
    ]

    const navItems: AppNavigationItem[] = [
      {
        name: $gettext('Verfahrensverzeichnis'),
        icon: 'shield-check',
        route: { path: urlJoin(appInfo.id, 'records') },
        activeFor: [{ name: `${appId}-records` }],
        isVisible: () => !!userStore.user
      },
      {
        name: $gettext('Auftragsverarbeiter & AVV'),
        icon: 'file-shield-2',
        route: { path: urlJoin(appInfo.id, 'avv') },
        activeFor: [{ name: `${appId}-avv` }],
        isVisible: () => !!userStore.user
      }
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
