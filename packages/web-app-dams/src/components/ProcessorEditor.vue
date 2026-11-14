<template>
  <form class="ext:flex ext:flex-col ext:gap-4 ext:p-4" @submit.prevent="submit">
    <div v-for="field in textFields" :key="field">
      <label class="ext:block ext:text-sm ext:font-medium ext:mb-1" :for="`field-${field}`">
        {{ $gettext(labels[field]) }}
      </label>
      <input
        :id="`field-${field}`"
        v-model="draft[field]"
        type="text"
        class="ext:w-full ext:rounded ext:border ext:border-gray-300 ext:px-3 ext:py-2 ext:text-sm"
        :required="field !== 'drittland' && field !== 'tom'"
      />
    </div>
    <div>
      <label class="ext:block ext:text-sm ext:font-medium ext:mb-1" for="field-status">
        {{ $gettext('Status') }}
      </label>
      <select
        id="field-status"
        v-model="draft.status"
        class="ext:w-full ext:rounded ext:border ext:border-gray-300 ext:px-3 ext:py-2 ext:text-sm"
      >
        <option v-for="status in statusValues" :key="status" :value="status">
          {{ status }}
        </option>
      </select>
    </div>
    <div>
      <label class="ext:block ext:text-sm ext:font-medium ext:mb-1" for="field-verfahren">
        {{ $gettext('Betroffene Verfahren') }}
      </label>
      <input
        id="field-verfahren"
        v-model="verfahrenInput"
        type="text"
        class="ext:w-full ext:rounded ext:border ext:border-gray-300 ext:px-3 ext:py-2 ext:text-sm"
        :placeholder="$gettext('Kommagetrennt, z. B. Lohnbuchhaltung, Webanalyse')"
      />
    </div>
    <div>
      <label class="ext:block ext:text-sm ext:font-medium ext:mb-1" for="field-beschreibung">
        {{ $gettext('Notizen (Markdown)') }}
      </label>
      <textarea
        id="field-beschreibung"
        v-model="draft.beschreibung"
        rows="10"
        class="ext:w-full ext:rounded ext:border ext:border-gray-300 ext:px-3 ext:py-2 ext:text-sm ext:font-mono"
      />
    </div>
    <p class="ext:text-xs ext:text-gray-500">
      {{
        $gettext(
          'Beim Speichern wird eine neue Dateiversion in OpenCloud erzeugt (Versionshistorie über die Datei-Details einsehbar).'
        )
      }}
    </p>
    <div class="ext:flex ext:justify-end ext:gap-2">
      <OcButton variation="passive" size="small" type="button" @click="emit('cancel')">
        {{ $gettext('Abbrechen') }}
      </OcButton>
      <OcButton variation="primary" size="small" type="button" @click="submit">
        {{ $gettext('Speichern') }}
      </OcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { OcButton } from '@opencloud-eu/design-system/components'
import { ref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { PROCESSOR_FIELDS, PROCESSOR_STATUS_VALUES, ProcessorRecord } from '../types'

const props = defineProps<{ processor: ProcessorRecord }>()
const emit = defineEmits<{
  (e: 'save', processor: ProcessorRecord): void
  (e: 'cancel'): void
}>()

const { $gettext } = useGettext()

const draft = ref<ProcessorRecord>({
  ...props.processor,
  verfahren: [...props.processor.verfahren]
})
const verfahrenInput = ref(draft.value.verfahren.join(', '))
const statusValues = [...PROCESSOR_STATUS_VALUES]

const textFields = PROCESSOR_FIELDS
const labels = {
  firma: 'Auftragsverarbeiter (Firma)',
  dienstleistung: 'Dienstleistung',
  kontakt: 'Ansprechpartner / Kontakt',
  vertragsbeginn: 'Vertragsbeginn (JJJJ-MM-TT)',
  vertragsende: 'Vertragsende (JJJJ-MM-TT oder unbefristet)',
  drittland: 'Drittlandübermittlung (Ja/Nein, ggf. Garantien)',
  tom: 'TOM-Dokument erhalten (Ja/Nein)'
}

const submit = () => {
  draft.value.verfahren = verfahrenInput.value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  emit('save', { ...draft.value })
}
</script>
