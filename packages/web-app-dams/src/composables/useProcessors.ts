import { useMessages } from '@opencloud-eu/web-pkg'
import { computed, ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useSpaceDocuments } from './useSpaceDocuments'
import { buildFileName } from '../lib/frontmatter'
import { toProcessorMarkdown, toProcessorRecord } from '../lib/avv'
import { DamsConfig, ProcessorRecord } from '../types'

export const useProcessors = (config: () => DamsConfig) => {
  const { $gettext } = useGettext()
  const { showMessage } = useMessages()

  const documents = useSpaceDocuments(
    () => config().spaceName,
    () => config().processorsFolderPath
  )

  const processors = ref<ProcessorRecord[]>([])

  const loadProcessors = async () => {
    const loaded = await documents.loadDocuments()
    processors.value = loaded
      .map((doc) => toProcessorRecord(doc.fileName, doc.path, doc.content, doc.etag))
      .sort((a, b) => a.firma.localeCompare(b.firma, 'de'))
  }

  const saveProcessor = async (record: ProcessorRecord): Promise<ProcessorRecord | null> => {
    const today = new Date().toISOString().slice(0, 10)
    if (!record.erstellt) {
      record.erstellt = today
    }
    record.geaendert = today
    const isNew = !record.path
    if (isNew) {
      record.fileName = buildFileName(
        record.firma,
        unref(processors).map((p) => p.fileName)
      )
    }
    const saved = await documents.saveDocument(
      record.fileName,
      record.path,
      toProcessorMarkdown(record),
      record.etag
    )
    if (!saved) {
      return null
    }
    record.path = saved.path
    record.etag = saved.etag
    if (isNew) {
      processors.value = [...unref(processors), record]
    }
    showMessage({
      title: $gettext('»%{name}« wurde gespeichert. Eine neue Version wurde erstellt.', {
        name: record.firma
      })
    })
    return record
  }

  const canWrite = computed(() => unref(documents.canWrite))
  const loading = computed(() => unref(documents.loading))
  const space = computed(() => unref(documents.space))

  return {
    processors,
    loading,
    space,
    canWrite,
    loadProcessors,
    saveProcessor
  }
}
