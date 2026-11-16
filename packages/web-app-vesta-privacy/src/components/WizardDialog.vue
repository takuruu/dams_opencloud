<template>
  <form class="ext:flex ext:flex-col ext:gap-4 ext:p-4" @submit.prevent="finish">
    <div>
      <p class="ext:text-xs ext:text-gray-500 ext:dark:text-gray-400 ext:mb-1">
        {{ $gettext('Schritt %{current} von %{total}', { current: step + 1, total: fields.length }) }}
      </p>
      <div class="ext:h-1 ext:rounded ext:bg-gray-200 ext:dark:bg-gray-700 ext:overflow-hidden">
        <div
          class="ext:h-full ext:bg-primary ext:transition-all"
          :style="{ width: `${((step + 1) / fields.length) * 100}%` }"
        ></div>
      </div>
    </div>
    <div v-if="currentField">
      <label class="ext:block ext:text-sm ext:font-medium ext:mb-1" :for="`wizard-${currentField.key}`">
        {{ $gettext(currentField.label) }}
        <span v-if="currentField.required" class="ext:text-red-500">*</span>
      </label>
      <select
        v-if="currentField.type === 'select'"
        :id="`wizard-${currentField.key}`"
        v-model="draft.data[currentField.key]"
        class="ext:w-full ext:rounded ext:border ext:border-gray-300 ext:px-3 ext:py-2 ext:text-sm ext:bg-white ext:text-gray-900 ext:dark:bg-gray-800 ext:dark:text-gray-100 ext:dark:border-gray-600"
      >
        <option v-for="option in currentField.options" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
      <textarea
        v-else-if="currentField.type === 'textarea'"
        :id="`wizard-${currentField.key}`"
        v-model="draft.beschreibung"
        rows="8"
        class="ext:w-full ext:rounded ext:border ext:border-gray-300 ext:px-3 ext:py-2 ext:text-sm ext:font-mono ext:bg-white ext:text-gray-900 ext:dark:bg-gray-800 ext:dark:text-gray-100 ext:dark:border-gray-600"
      />
      <input
        v-else-if="currentField.type === 'list'"
        :id="`wizard-${currentField.key}`"
        v-model="listInputs[currentField.key]"
        type="text"
        class="ext:w-full ext:rounded ext:border ext:border-gray-300 ext:px-3 ext:py-2 ext:text-sm ext:bg-white ext:text-gray-900 ext:dark:bg-gray-800 ext:dark:text-gray-100 ext:dark:border-gray-600"
        :placeholder="currentField.placeholder ? $gettext(currentField.placeholder) : ''"
      />
      <input
        v-else
        :id="`wizard-${currentField.key}`"
        v-model="draft.data[currentField.key]"
        :type="currentField.type === 'date' ? 'date' : 'text'"
        class="ext:w-full ext:rounded ext:border ext:border-gray-300 ext:px-3 ext:py-2 ext:text-sm ext:bg-white ext:text-gray-900 ext:dark:bg-gray-800 ext:dark:text-gray-100 ext:dark:border-gray-600"
      />
      <p v-if="currentField.placeholder && currentField.type !== 'list'" class="ext:text-xs ext:text-gray-400 ext:dark:text-gray-500 ext:mt-1">
        {{ $gettext(currentField.placeholder) }}
      </p>
    </div>
    <div class="ext:flex ext:justify-between ext:gap-2 ext:mt-2">
      <OcButton variation="passive" size="small" type="button" @click="emit('cancel')">
        {{ $gettext('Abbrechen') }}
      </OcButton>
      <div class="ext:flex ext:gap-2">
        <OcButton
          v-if="step > 0"
          variation="passive"
          size="small"
          type="button"
          @click="step--"
        >
          {{ $gettext('Zurück') }}
        </OcButton>
        <OcButton
          v-if="step < fields.length - 1"
          variation="primary"
          size="small"
          type="button"
          :disabled="isCurrentRequired && !currentValue"
          @click="step++"
        >
          {{ $gettext('Weiter') }}
        </OcButton>
        <OcButton
          v-else
          variation="primary"
          size="small"
          type="button"
          :disabled="!canFinish"
          @click="finish"
        >
          {{ $gettext('Anlegen') }}
        </OcButton>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { OcButton } from '@opencloud-eu/design-system/components'
import { computed, ref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { DamsModule, ModuleField, ModuleRecord } from '../types'

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
  fileName: '',
  path: '',
  data: { ...props.record.data },
  beschreibung: props.record.beschreibung
})

const fields = props.module.fields.filter((f) => f.key !== 'beschreibung')

const listInputs = ref<Record<string, string>>(
  Object.fromEntries(
    props.module.fields
      .filter((f) => f.type === 'list')
      .map((f) => [
        f.key,
        Array.isArray(props.record.data[f.key])
          ? (props.record.data[f.key] as string[]).join(', ')
          : String(props.record.data[f.key] ?? '')
      ])
  )
)

const step = ref(0)
const currentField = computed<ModuleField | undefined>(() => fields[step.value])
const currentValue = computed(() => {
  const field = currentField.value
  if (!field) {
    return ''
  }
  if (field.type === 'list') {
    return listInputs.value[field.key] ?? ''
  }
  return String(draft.value.data[field.key] ?? '')
})
const isCurrentRequired = computed(() => !!currentField.value?.required)
const canFinish = computed(() =>
  fields.every((f) => !f.required || (f.type === 'list' ? (listInputs.value[f.key] || '').trim() : String(draft.value.data[f.key] ?? '').trim()))
)

const finish = () => {
  for (const field of props.module.fields) {
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
