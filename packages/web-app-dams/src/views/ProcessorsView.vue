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
        <h1>{{ $gettext('Auftragsverarbeiter & AVV') }}</h1>
        <OcButton
          v-if="canWrite"
          variation="primary"
          size="small"
          @click="openEditor(emptyProcessor())"
        >
          {{ $gettext('Neuer Auftragsverarbeiter') }}
        </OcButton>
      </div>
      <p class="ext:text-sm ext:text-gray-500">
        {{
          $gettext(
            'Verzeichnis der Auftragsverarbeiter inkl. Auftragsverarbeitungsverträgen (Art. 28 DSGVO). Jede Änderung erzeugt automatisch eine neue Dateiversion in OpenCloud.'
          )
        }}
      </p>
      <div v-if="loading">{{ $gettext('Lade Verzeichnis …') }}</div>
      <table v-else-if="processors.length" class="ext:w-full ext:text-left ext:text-sm">
        <thead>
          <tr class="ext:border-b ext:border-gray-200">
            <th class="ext:py-2 ext:pr-4">{{ $gettext('Auftragsverarbeiter') }}</th>
            <th class="ext:py-2 ext:pr-4">{{ $gettext('Dienstleistung') }}</th>
            <th class="ext:py-2 ext:pr-4">{{ $gettext('Status') }}</th>
            <th class="ext:py-2 ext:pr-4">{{ $gettext('Vertragsende') }}</th>
            <th class="ext:py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="processor in processors"
            :key="processor.path"
            class="ext:border-b ext:border-gray-100"
          >
            <td class="ext:py-2 ext:pr-4 ext:font-medium">{{ processor.firma }}</td>
            <td class="ext:py-2 ext:pr-4">{{ processor.dienstleistung }}</td>
            <td class="ext:py-2 ext:pr-4">{{ processor.status }}</td>
            <td class="ext:py-2 ext:pr-4">{{ processor.vertragsende }}</td>
            <td class="ext:py-2 ext:text-right">
              <OcButton
                v-if="canWrite"
                variation="raw"
                size="small"
                @click="openEditor({ ...processor })"
              >
                {{ $gettext('Bearbeiten') }}
              </OcButton>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="ext:p-8 ext:text-gray-500">
        {{ $gettext('Noch keine Auftragsverarbeiter dokumentiert.') }}
      </div>
      <div
        v-if="editorOpen"
        class="ext:fixed ext:inset-y-0 ext:right-0 ext:w-96 ext:max-w-full ext:overflow-y-auto ext:border-l ext:border-gray-200 ext:bg-white ext:shadow-lg"
      >
        <ProcessorEditor
          v-if="editorProcessor"
          :processor="editorProcessor"
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
import { useProcessors } from '../composables/useProcessors'
import { defaultConfig, DamsConfig, ProcessorRecord } from '../types'
import ProcessorEditor from '../components/ProcessorEditor.vue'

const props = defineProps<{ applicationConfig?: AppConfigObject }>()

const { $gettext } = useGettext()

const config = computed<DamsConfig>(() => ({
  ...defaultConfig,
  ...((unref(props.applicationConfig) || {}) as Partial<DamsConfig>)
}))

const { processors, loading, space, canWrite, loadProcessors, saveProcessor } = useProcessors(() =>
  unref(config)
)

const editorOpen = ref(false)
const editorProcessor = ref<ProcessorRecord | null>(null)

const emptyProcessor = (): ProcessorRecord => ({
  fileName: '',
  path: '',
  firma: '',
  dienstleistung: '',
  kontakt: '',
  vertragsbeginn: '',
  vertragsende: '',
  status: 'entwurf',
  drittland: 'Nein',
  tom: 'Nein',
  verfahren: [],
  erstellt: '',
  geaendert: '',
  beschreibung: ''
})

const openEditor = (processor: ProcessorRecord) => {
  editorProcessor.value = processor
  editorOpen.value = true
}

const saveFromEditor = async (processor: ProcessorRecord) => {
  const saved = await saveProcessor(processor)
  if (saved) {
    editorOpen.value = false
  }
}

onMounted(() => loadProcessors())
</script>
