import '@opencloud-eu/extension-sdk/tailwind.css'
import {
  AppMenuItemExtension,
  AppWrapperRoute,
  defineWebApplication,
  useUserStore
} from '@opencloud-eu/web-pkg'
import { urlJoin } from '@opencloud-eu/web-client'
import { RouteRecordRaw } from 'vue-router'
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { appId } from './types'
import AppView from './views/AppView.vue'

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
        component: AppWrapperRoute(AppView, { applicationId: appId }),
        meta: {
          authContext: 'user',
          title: $gettext('Verfahrensverzeichnis')
        }
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
      extensions
    }
  }
})
