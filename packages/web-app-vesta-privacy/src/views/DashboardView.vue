<template>
  <main class="ext:flex ext:flex-col ext:size-full ext:rounded-l-xl ext:p-8 ext:gap-6">
    <div v-if="!space" class="ext:p-4">
      <h1>{{ $gettext('Datenschutz') }}</h1>
      <p>
        {{
          $gettext(
            'Es wurde kein Space »Datenschutz« gefunden. Bitte legen Sie einen entsprechenden Space an oder passen Sie die App-Konfiguration an.'
          )
        }}
      </p>
    </div>
    <template v-else>
      <div class="ext:flex ext:items-center ext:justify-between">
        <h1>{{ $gettext('Dashboard') }}</h1>
        <OcButton variation="passive" size="small" :href="companyRoute">
          {{ $gettext('Unternehmens-Stammdaten') }}
        </OcButton>
      </div>

      <div v-if="loading">{{ $gettext('Lade Daten …') }}</div>

      <template v-else>
        <section
          class="ext:flex ext:flex-col ext:gap-2 ext:rounded-lg ext:border ext:border-gray-200 ext:p-6 ext:dark:border-gray-700"
        >
          <div class="ext:flex ext:items-baseline ext:justify-between">
            <h2 class="ext:m-0">{{ $gettext('Reifegrad des Datenschutzmanagements') }}</h2>
            <span class="ext:text-2xl ext:font-semibold">{{ Math.round(stats.ratio * 100) }} %</span>
          </div>
          <div
            class="ext:h-3 ext:w-full ext:overflow-hidden ext:rounded-full ext:bg-gray-200 ext:dark:bg-gray-700"
          >
            <div
              class="ext:h-full ext:rounded-full ext:bg-green-600 ext:transition-all"
              :style="{ width: `${Math.round(stats.ratio * 100)}%` }"
            ></div>
          </div>
          <p class="ext:m-0 ext:text-sm ext:text-gray-500 ext:dark:text-gray-400">
            {{
              $gettext('%{done} von %{total} Einträgen abgeschlossen', {
                done: stats.done,
                total: stats.total
              })
            }}
          </p>
        </section>

        <section class="ext:grid ext:grid-cols-1 ext:gap-4 ext:sm:grid-cols-2 ext:lg:grid-cols-3">
          <RouterLink
            v-for="m in stats.modules"
            :key="m.module.id"
            :to="{ name: `${appId}-${m.module.id}` }"
            class="ext:flex ext:flex-col ext:gap-1 ext:rounded-lg ext:border ext:border-gray-200 ext:p-4 ext:hover:bg-gray-50 ext:dark:border-gray-700 ext:dark:hover:bg-gray-800"
          >
            <span class="ext:font-medium">{{ $gettext(m.module.title) }}</span>
            <span class="ext:text-sm ext:text-gray-500 ext:dark:text-gray-400">
              {{
                $gettext('%{done} von %{total} abgeschlossen', {
                  done: m.done,
                  total: m.total
                })
              }}
            </span>
            <div
              class="ext:h-2 ext:w-full ext:overflow-hidden ext:rounded-full ext:bg-gray-200 ext:dark:bg-gray-700"
            >
              <div
                class="ext:h-full ext:rounded-full ext:bg-green-600"
                :style="{ width: `${Math.round(m.ratio * 100)}%` }"
              ></div>
            </div>
          </RouterLink>
        </section>

        <section
          v-if="company"
          class="ext:flex ext:flex-col ext:gap-2 ext:rounded-lg ext:border ext:border-gray-200 ext:p-6 ext:dark:border-gray-700"
        >
          <h2 class="ext:m-0">{{ $gettext('Unternehmen') }}</h2>
          <dl class="ext:m-0 ext:grid ext:grid-cols-1 ext:gap-x-8 ext:gap-y-2 ext:sm:grid-cols-2">
            <div v-for="row in companyRows" :key="row.label" class="ext:flex ext:gap-2">
              <dt class="ext:text-sm ext:text-gray-500 ext:dark:text-gray-400">{{ row.label }}:</dt>
              <dd class="ext:m-0 ext:text-sm">{{ row.value || '—' }}</dd>
            </div>
          </dl>
        </section>
      </template>
    </template>
  </main>
</template>

<script setup lang="ts">
import { OcButton } from '@opencloud-eu/design-system/components'
import { AppConfigObject } from '@opencloud-eu/web-pkg'
import { urlJoin } from '@opencloud-eu/web-client'
import { computed, onMounted, ref, unref } from 'vue'
import { RouterLink } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { useSpaceDocuments } from '../composables/useSpaceDocuments'
import { computeDashboardStats, DashboardStats, parseRawRecords } from '../lib/dashboard'
import { appId, defaultConfig, DamsConfig, getModule, MODULES, ModuleRecord } from '../types'

const props = defineProps<{
  applicationConfig?: AppConfigObject
}>()

const { $gettext } = useGettext()

const config = computed<DamsConfig>(() => {
  const appConfig = (unref(props.applicationConfig) || {}) as Partial<DamsConfig>
  return {
    spaceName: appConfig.spaceName ?? defaultConfig.spaceName,
    folderPaths: { ...defaultConfig.folderPaths, ...(appConfig.folderPaths || {}) }
  }
})

const loading = ref(true)
const stats = ref<DashboardStats>({ modules: [], total: 0, done: 0, open: 0, ratio: 0 })
const company = ref<ModuleRecord | null>(null)

const documentsFor = (moduleId: string) => {
  const module = getModule(moduleId)
  return useSpaceDocuments(
    () => unref(config).spaceName,
    () => unref(config).folderPaths[module.configKey] ?? module.folderPath
  )
}

const companyDocs = documentsFor('company')
const moduleDocs = MODULES.filter((m) => m.id !== 'company').map((m) => ({
  module: m,
  docs: documentsFor(m.id)
}))

const space = computed(() => unref(companyDocs.space))
const companyRoute = computed(() => urlJoin(appId, 'unternehmen'))

const companyRows = computed(() => {
  const c = unref(company)
  if (!c) {
    return []
  }
  const module = getModule('company')
  return module.fields
    .filter((f) => f.type !== 'textarea')
    .map((f) => ({
      label: $gettext(f.label),
      value: (() => {
        const v = c.data[f.key]
        return Array.isArray(v) ? v.join(', ') : String(v ?? '')
      })()
    }))
})

onMounted(async () => {
  loading.value = true
  const recordsByModule = new Map<string, ModuleRecord[]>()
  await Promise.all(
    moduleDocs.map(async ({ module, docs }) => {
      const loaded = await docs.loadDocuments()
      recordsByModule.set(module.id, parseRawRecords(module, loaded))
    })
  )
  const companyLoaded = await companyDocs.loadDocuments()
  if (companyLoaded.length) {
    company.value = parseRawRecords(getModule('company'), companyLoaded)[0]
  }
  stats.value = computeDashboardStats(recordsByModule)
  loading.value = false
})
</script>
