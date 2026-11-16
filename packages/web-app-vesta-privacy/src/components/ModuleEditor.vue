<template>
  <form class="ext:flex ext:flex-col ext:gap-4 ext:p-4" @submit.prevent="submit">
    <div v-for="field in fields" :key="field.key">
      <label class="ext:block ext:text-sm ext:font-medium ext:mb-1" :for="`field-${field.key}`">
        {{ $gettext(field.label) }}
      </label>
      <select
        v-if="field.type === 'select'"
        :id="`field-${field.key}`"
        v-model="draft.data[field.key]"
        class="ext:w-full ext:rounded ext:border ext:border-gray-300 ext:px-3 ext:py-2 ext:text-sm ext:bg-white ext:text-gray-900 ext:dark:bg-gray-800 ext:dark:text-gray-100 ext:dark:border-gray-600"
      >
        <option v-for="option in field.options" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
      <textarea
        v-else-if="field.type === 'textarea'"
        :id="`field-${field.key}`"
        v-model="draft.beschreibung"
        rows="10"
        class="ext:w-full ext:rounded ext:border ext:border-gray-300 ext:px-3 ext:py-2 ext:text-sm ext:font-mono ext:bg-white ext:text-gray-900 ext:dark:bg-gray-800 ext:dark:text-gray-100 ext:dark:border-gray-600"
      />
      <input
        v-else-if="field.type === 'list'"
        :id="`field-${field.key}`"
        v-model="listInputs[field.key]"
        type="text"
        class="ext:w-full ext:rounded ext:border ext:border-gray-300 ext:px-3 ext:py-2 ext:text-sm ext:bg-white ext:text-gray-900 ext:dark:bg-gray-800 ext:dark:text-gray-100 ext:dark:border-gray-600"
        :placeholder="field.placeholder ? $gettext(field.placeholder) : ''"
        :required="field.required"
      />
      <input
        v-else
        :id="`field-${field.key}`"
        v-model="draft.data[field.key]"
        :type="field.type === 'date' ? 'date' : 'text'"
        class="ext:w-full ext:rounded ext:border ext:border-gray-300 ext:px-3 ext:py-2 ext:text-sm ext:bg-white ext:text-gray-900 ext:dark:bg-gray-800 ext:dark:text-gray-100 ext:dark:border-gray-600"
        :required="field.required"
      />
    </div>
    <p class="ext:text-xs ext:text-gray-500 ext:dark:text-gray-400">
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
import { DamsModule, ModuleRecord } from '../types'

const props = defineProps<{
  module: DamsModule
  record: ModuleRecord
}>()

const emit = defineEmits<{
  (e: 'save', record: ModuleRecord): void
  (e: 'cancel'): void
}>()

const { $gettext } = useGettext()

const draft = ref<ModuleRecord>({
  ...props.record,
  data: { ...props.record.data },
  beschreibung: props.record.beschreibung
})

const fields = props.module.fields

const listInputs = ref<Record<string, string>>(
  Object.fromEntries(
    fields
      .filter((f) => f.type === 'list')
      .map((f) => [f.key, ((props.record.data[f.key] as string[]) || []).join(', ')])
  )
)

const submit = () => {
  for (const field of fields) {
    if (field.type === 'list') {
      draft.value.data[field.key] = (listInputs.value[field.key] || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }
  }
  emit('save', { ...draft.value, data: { ...draft.value.data } })
}
</script>
