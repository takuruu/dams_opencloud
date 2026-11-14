import { useMessages } from '@opencloud-eu/web-pkg'
import { computed, ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useSpaceDocuments } from './useSpaceDocuments'
import { buildFileName } from '../lib/frontmatter'
import { buildModuleMarkdown, parseModuleRecord } from '../lib/documents'
import { DamsConfig, DamsModule, ModuleRecord } from '../types'

export const useModule = (module: DamsModule, config: () => DamsConfig) => {
  const { $gettext } = useGettext()
  const { showMessage } = useMessages()

  const documents = useSpaceDocuments(
    () => config().spaceName,
    () => config().folderPaths[module.configKey] ?? module.folderPath
  )

  const records = ref<ModuleRecord[]>([])

  const loadRecords = async () => {
    const loaded = await documents.loadDocuments()
    records.value = loaded
      .map((doc) => parseModuleRecord(module, doc.fileName, doc.path, doc.content, doc.etag))
      .sort((a, b) =>
        String(a.data[module.nameField] ?? '').localeCompare(
          String(b.data[module.nameField] ?? ''),
          'de'
        )
      )
  }

  const saveRecord = async (record: ModuleRecord): Promise<ModuleRecord | null> => {
    const today = new Date().toISOString().slice(0, 10)
    if (!record.data.erstellt) {
      record.data.erstellt = today
    }
    record.data.geaendert = today
    const isNew = !record.path
    if (isNew) {
      record.fileName = buildFileName(
        String(record.data[module.nameField] ?? ''),
        unref(records).map((r) => r.fileName)
      )
    }
    const saved = await documents.saveDocument(
      record.fileName,
      record.path,
      buildModuleMarkdown(module, record),
      record.etag
    )
    if (!saved) {
      return null
    }
    record.path = saved.path
    record.etag = saved.etag
    if (isNew) {
      records.value = [...unref(records), record]
    }
    showMessage({
      title: $gettext('»%{name}« wurde gespeichert. Eine neue Version wurde erstellt.', {
        name: String(record.data[module.nameField] ?? record.fileName)
      })
    })
    return record
  }

  const canWrite = computed(() => unref(documents.canWrite))
  const loading = computed(() => unref(documents.loading))
  const space = computed(() => unref(documents.space))

  return {
    records,
    loading,
    space,
    canWrite,
    loadRecords,
    saveRecord
  }
}
