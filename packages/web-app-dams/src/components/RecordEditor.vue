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
        :required="field !== 'drittland'"
      />
    </div>
    <div>
      <label class="ext:block ext:text-sm ext:font-medium ext:mb-1" for="field-kategorien">
        {{ $gettext('Kategorien personenbezogener Daten') }}
      </label>
      <input
        id="field-kategorien"
        v-model="kategorienInput"
        type="text"
        class="ext:w-full ext:rounded ext:border ext:border-gray-300 ext:px-3 ext:py-2 ext:text-sm"
        :placeholder="$gettext('Kommagetrennt, z. B. IP-Adresse, Nutzungsdaten')"
        required
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
      <label class="ext:block ext:text-sm ext:font-medium ext:mb-1" for="field-beschreibung">
        {{ $gettext('Beschreibung (Markdown)') }}
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
import { ProcessingRecord, RECORD_FIELDS, STATUS_VALUES } from '../types'

const props = defineProps<{ record: ProcessingRecord }>()
const emit = defineEmits<{
  (e: 'save', record: ProcessingRecord): void
  (e: 'cancel'): void
}>()

const { $gettext } = useGettext()

const draft = ref<ProcessingRecord>({ ...props.record, kategorien: [...props.record.kategorien] })
const kategorienInput = ref(draft.value.kategorien.join(', '))
const statusValues = [...STATUS_VALUES]

const textFields = RECORD_FIELDS.filter((f) => f !== 'status')
const labels = {
  titel: 'Titel der Verarbeitungstätigkeit',
  verantwortlicher: 'Verantwortlicher',
  zweck: 'Zweck der Verarbeitung',
  betroffene: 'Kategorien betroffener Personen',
  empfaenger: 'Empfänger',
  drittland: 'Drittlandübermittlung',
  loeschfrist: 'Löschfristen',
  rechtsgrundlage: 'Rechtsgrundlage'
}

const submit = () => {
  draft.value.kategorien = kategorienInput.value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  emit('save', { ...draft.value })
}
</script>
