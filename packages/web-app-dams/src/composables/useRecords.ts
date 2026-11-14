import { Resource, SpaceResource, urlJoin } from '@opencloud-eu/web-client'
import { useClientService, useMessages, useSpacesStore, useUserStore } from '@opencloud-eu/web-pkg'
import { computed, ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { buildFileName, toMarkdown, toRecord } from '../lib/frontmatter'
import { DamsConfig, ProcessingRecord } from '../types'

export const useRecords = (config: () => DamsConfig) => {
  const { $gettext } = useGettext()
  const clientService = useClientService()
  const spacesStore = useSpacesStore()
  const userStore = useUserStore()
  const { showMessage, showErrorMessage } = useMessages()

  const records = ref<ProcessingRecord[]>([])
  const loading = ref(false)
  const folderMissing = ref(false)

  const space = computed<SpaceResource | null>(() => {
    const cfg = config()
    return (
      unref(spacesStore.spaces).find((s) => s.name.toLowerCase() === cfg.spaceName.toLowerCase()) ||
      null
    )
  })

  const loadRecords = async () => {
    const currentSpace = unref(space)
    if (!currentSpace) {
      return
    }
    loading.value = true
    try {
      const { folderPath } = config()
      let folder: Resource
      try {
        folder = await clientService.webdav.getFileInfo(currentSpace, { path: folderPath })
      } catch {
        await clientService.webdav.createFolder(currentSpace, { path: folderPath })
        folder = await clientService.webdav.getFileInfo(currentSpace, { path: folderPath })
      }
      folderMissing.value = false
      const { children } = await clientService.webdav.listFiles(currentSpace, {
        path: folder.path
      })
      const markdownFiles = (children || []).filter(
        (r) => !r.isFolder && r.name.toLowerCase().endsWith('.md')
      )
      const loaded: ProcessingRecord[] = []
      for (const file of markdownFiles) {
        const content = await clientService.webdav.getFileContents(currentSpace, {
          path: file.path
        })
        loaded.push(toRecord(file.name, file.path, String(content), file.etag))
      }
      records.value = loaded.sort((a, b) => a.titel.localeCompare(b.titel, 'de'))
    } catch (e) {
      console.error('Failed to load records', e)
      showErrorMessage({ title: $gettext('Verzeichnis konnte nicht geladen werden'), errors: [e] })
    } finally {
      loading.value = false
    }
  }

  const saveRecord = async (record: ProcessingRecord): Promise<ProcessingRecord | null> => {
    const currentSpace = unref(space)
    if (!currentSpace) {
      return null
    }
    const today = new Date().toISOString().slice(0, 10)
    if (!record.erstellt) {
      record.erstellt = today
    }
    record.geaendert = today
    try {
      const { folderPath } = config()
      const isNew = !record.path
      if (isNew) {
        record.fileName = buildFileName(
          record.titel,
          unref(records).map((r) => r.fileName)
        )
        record.path = urlJoin(folderPath, record.fileName)
      }
      const resource = await clientService.webdav.putFileContents(currentSpace, {
        path: record.path,
        content: toMarkdown(record),
        previousEntityTag: isNew ? undefined : record.etag
      })
      record.etag = resource.etag
      if (isNew) {
        records.value = [...unref(records), record]
      }
      showMessage({
        title: $gettext('»%{name}« wurde gespeichert. Eine neue Version wurde erstellt.', {
          name: record.titel
        })
      })
      return record
    } catch (e) {
      console.error('Failed to save record', e)
      showErrorMessage({ title: $gettext('Speichern fehlgeschlagen'), errors: [e] })
      return null
    }
  }

  const canWrite = computed(() => {
    return unref(space)?.canUpload({ user: unref(userStore.user) }) ?? false
  })

  return {
    records,
    loading,
    space,
    canWrite,
    loadRecords,
    saveRecord
  }
}
