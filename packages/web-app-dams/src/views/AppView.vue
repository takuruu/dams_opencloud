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
        <h1>{{ $gettext('Verfahrensverzeichnis (Art. 30 DSGVO)') }}</h1>
        <OcButton
          v-if="canWrite"
          variation="primary"
          size="small"
          @click="openEditor(emptyRecord())"
        >
          {{ $gettext('Neues Verfahren') }}
        </OcButton>
      </div>
      <p class="ext:text-sm ext:text-gray-500">
        {{
          $gettext(
            'Alle Einträge sind Markdown-Dateien im Space. Jede Änderung erzeugt automatisch eine neue Dateiversion in OpenCloud.'
          )
        }}
      </p>
      <div v-if="loading">{{ $gettext('Lade Verzeichnis …') }}</div>
      <table v-else-if="records.length" class="ext:w-full ext:text-left ext:text-sm">
        <thead>
          <tr class="ext:border-b ext:border-gray-200">
            <th class="ext:py-2 ext:pr-4">{{ $gettext('Titel') }}</th>
            <th class="ext:py-2 ext:pr-4">{{ $gettext('Zweck') }}</th>
            <th class="ext:py-2 ext:pr-4">{{ $gettext('Status') }}</th>
            <th class="ext:py-2 ext:pr-4">{{ $gettext('Geändert') }}</th>
            <th class="ext:py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.path" class="ext:border-b ext:border-gray-100">
            <td class="ext:py-2 ext:pr-4 ext:font-medium">{{ record.titel }}</td>
            <td class="ext:py-2 ext:pr-4">{{ record.zweck }}</td>
            <td class="ext:py-2 ext:pr-4">{{ record.status }}</td>
            <td class="ext:py-2 ext:pr-4">{{ record.geaendert }}</td>
            <td class="ext:py-2 ext:text-right">
              <OcButton
                v-if="canWrite"
                variation="raw"
                size="small"
                @click="openEditor({ ...record })"
              >
                {{ $gettext('Bearbeiten') }}
              </OcButton>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="ext:p-8 ext:text-gray-500">
        {{ $gettext('Noch keine Verfahren dokumentiert.') }}
      </div>
      <div
        v-if="editorOpen"
        class="ext:fixed ext:inset-y-0 ext:right-0 ext:w-96 ext:max-w-full ext:overflow-y-auto ext:border-l ext:border-gray-200 ext:bg-white ext:shadow-lg"
      >
        <RecordEditor
          v-if="editorRecord"
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
import { AppConfigObject } from '@opencloud-eu/web-pkg'
import { computed, onMounted, ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useRecords } from '../composables/useRecords'
import { defaultConfig, DamsConfig, ProcessingRecord } from '../types'
import RecordEditor from '../components/RecordEditor.vue'

const props = defineProps<{ applicationConfig?: AppConfigObject }>()

const { $gettext } = useGettext()

const config = computed<DamsConfig>(() => ({
  ...defaultConfig,
  ...((unref(props.applicationConfig) || {}) as Partial<DamsConfig>)
}))

const { records, loading, space, canWrite, loadRecords, saveRecord } = useRecords(() =>
  unref(config)
)

const editorOpen = ref(false)
const editorRecord = ref<ProcessingRecord | null>(null)

const emptyRecord = (): ProcessingRecord => ({
  fileName: '',
  path: '',
  titel: '',
  verantwortlicher: '',
  zweck: '',
  kategorien: [],
  betroffene: '',
  empfaenger: '',
  drittland: '',
  loeschfrist: '',
  rechtsgrundlage: '',
  status: 'entwurf',
  erstellt: '',
  geaendert: '',
  beschreibung: ''
})

const openEditor = (record: ProcessingRecord) => {
  editorRecord.value = record
  editorOpen.value = true
}

const saveFromEditor = async (record: ProcessingRecord) => {
  const saved = await saveRecord(record)
  if (saved) {
    editorOpen.value = false
  }
}

onMounted(() => loadRecords())
</script>
