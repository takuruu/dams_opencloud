<template>
  <main class="ext:flex ext:flex-col ext:size-full ext:rounded-l-xl ext:p-8 ext:gap-4">
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
        <h1>{{ module.title }}</h1>
        <OcButton
          v-if="canWrite"
          variation="primary"
          size="small"
          @click="openEditor(emptyRecord())"
        >
          {{ $gettext(module.newLabel) }}
        </OcButton>
      </div>
      <p class="ext:text-sm ext:text-gray-500">{{ $gettext(module.hint) }}</p>
      <div v-if="loading">{{ $gettext('Lade Verzeichnis …') }}</div>
      <table v-else-if="records.length" class="ext:w-full ext:text-left ext:text-sm">
        <thead>
          <tr class="ext:border-b ext:border-gray-200">
            <th v-for="column in module.columns" :key="column.key" class="ext:py-2 ext:pr-4">
              {{ $gettext(column.label) }}
            </th>
            <th class="ext:py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.path" class="ext:border-b ext:border-gray-100">
            <td
              v-for="(column, index) in module.columns"
              :key="column.key"
              class="ext:py-2 ext:pr-4"
              :class="{ 'ext:font-medium': index === 0 }"
            >
              {{ displayValue(record.data[column.key]) }}
            </td>
            <td class="ext:py-2 ext:text-right">
              <OcButton
                v-if="canWrite"
                variation="raw"
                size="small"
                @click="openEditor(cloneRecord(record))"
              >
                {{ $gettext('Bearbeiten') }}
              </OcButton>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="ext:p-8 ext:text-gray-500">
        {{ $gettext('Noch keine Einträge vorhanden.') }}
      </div>
      <div
        v-if="editorOpen"
        class="ext:fixed ext:inset-y-0 ext:right-0 ext:w-96 ext:max-w-full ext:overflow-y-auto ext:border-l ext:border-gray-200 ext:bg-white ext:shadow-lg"
      >
        <ModuleEditor
          v-if="editorRecord"
          :module="module"
          :record="editorRecord"
          @save="saveFromEditor"
          @cancel="editorOpen = false"
        />
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { OcButton } from '@opencloud-eu/design-system/components'
import { AppConfigObject, useRoute } from '@opencloud-eu/web-pkg'
import { computed, onMounted, ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useModule } from '../composables/useModule'
import { emptyModuleRecord } from '../lib/documents'
import { appId, defaultConfig, DamsConfig, DamsModule, getModule, ModuleRecord } from '../types'
import ModuleEditor from '../components/ModuleEditor.vue'

const props = defineProps<{
  applicationConfig?: AppConfigObject
}>()

const { $gettext } = useGettext()
const route = useRoute()
const module = computed<DamsModule>(() =>
  getModule(String(route.value?.name ?? '').replace(`${appId}-`, ''))
)

const config = computed<DamsConfig>(() => {
  const appConfig = (unref(props.applicationConfig) || {}) as Partial<DamsConfig>
  return {
    spaceName: appConfig.spaceName ?? defaultConfig.spaceName,
    folderPaths: { ...defaultConfig.folderPaths, ...(appConfig.folderPaths || {}) }
  }
})

const { records, loading, space, canWrite, loadRecords, saveRecord } = useModule(
  unref(module),
  () => unref(config)
)

const editorOpen = ref(false)
const editorRecord = ref<ModuleRecord | null>(null)

const emptyRecord = (): ModuleRecord => emptyModuleRecord(unref(module))

const cloneRecord = (record: ModuleRecord): ModuleRecord => ({
  ...record,
  data: { ...record.data },
  etag: record.etag
})

const displayValue = (value: string | string[] | undefined): string => {
  return Array.isArray(value) ? value.join(', ') : (value ?? '')
}

const openEditor = (record: ModuleRecord) => {
  editorRecord.value = record
  editorOpen.value = true
}

const saveFromEditor = async (record: ModuleRecord) => {
  const saved = await saveRecord(record)
  if (saved) {
    editorOpen.value = false
  }
}

onMounted(() => loadRecords())
</script>
