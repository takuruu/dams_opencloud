import { useMessages } from '@opencloud-eu/web-pkg'
import { computed, ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useSpaceDocuments } from './useSpaceDocuments'
import { buildFileName, toMarkdown, toRecord } from '../lib/frontmatter'
import { DamsConfig, ProcessingRecord } from '../types'

export const useRecords = (config: () => DamsConfig) => {
  const { $gettext } = useGettext()
  const { showMessage } = useMessages()

  const documents = useSpaceDocuments(
    () => config().spaceName,
    () => config().folderPath
  )

  const records = ref<ProcessingRecord[]>([])

  const loadRecords = async () => {
    const loaded = await documents.loadDocuments()
    records.value = loaded
      .map((doc) => toRecord(doc.fileName, doc.path, doc.content, doc.etag))
      .sort((a, b) => a.titel.localeCompare(b.titel, 'de'))
  }

  const saveRecord = async (record: ProcessingRecord): Promise<ProcessingRecord | null> => {
    const today = new Date().toISOString().slice(0, 10)
    if (!record.erstellt) {
      record.erstellt = today
    }
    record.geaendert = today
    const isNew = !record.path
    if (isNew) {
      record.fileName = buildFileName(
        record.titel,
        unref(records).map((r) => r.fileName)
      )
    }
    const saved = await documents.saveDocument(
      record.fileName,
      record.path,
      toMarkdown(record),
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
        name: record.titel
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
