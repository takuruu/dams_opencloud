import { Resource, SpaceResource, urlJoin } from '@opencloud-eu/web-client'
import { useClientService, useMessages, useSpacesStore, useUserStore } from '@opencloud-eu/web-pkg'
import { computed, ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'

export interface SpaceDocument {
  fileName: string
  path: string
  etag?: string
  content: string
}

export const useSpaceDocuments = (spaceName: () => string, folderPath: () => string) => {
  const { $gettext } = useGettext()
  const clientService = useClientService()
  const spacesStore = useSpacesStore()
  const userStore = useUserStore()
  const { showErrorMessage } = useMessages()

  const loading = ref(false)

  const space = computed<SpaceResource | null>(() => {
    return (
      unref(spacesStore.spaces).find((s) => s.name.toLowerCase() === spaceName().toLowerCase()) ||
      null
    )
  })

  const ensureFolder = async (): Promise<Resource> => {
    const currentSpace = unref(space)
    const path = folderPath()
    try {
      return await clientService.webdav.getFileInfo(currentSpace, { path })
    } catch {
      await clientService.webdav.createFolder(currentSpace, { path })
      return await clientService.webdav.getFileInfo(currentSpace, { path })
    }
  }

  const loadDocuments = async (): Promise<SpaceDocument[]> => {
    const currentSpace = unref(space)
    if (!currentSpace) {
      return []
    }
    loading.value = true
    try {
      const folder = await ensureFolder()
      const { children } = await clientService.webdav.listFiles(currentSpace, {
        path: folder.path
      })
      const markdownFiles = (children || []).filter(
        (r) => !r.isFolder && r.name.toLowerCase().endsWith('.md')
      )
      const documents: SpaceDocument[] = []
      for (const file of markdownFiles) {
        const response = await clientService.webdav.getFileContents(currentSpace, {
          path: file.path
        })
        const content =
          typeof response === 'string'
            ? response
            : String((response as { body?: string }).body ?? '')
        documents.push({
          fileName: file.name,
          path: file.path,
          etag: file.etag,
          content
        })
      }
      return documents
    } catch (e) {
      console.error('Failed to load documents', e)
      showErrorMessage({ title: $gettext('Ordner konnte nicht geladen werden'), errors: [e] })
      return []
    } finally {
      loading.value = false
    }
  }

  const saveDocument = async (
    fileName: string,
    path: string,
    content: string,
    etag?: string
  ): Promise<SpaceDocument | null> => {
    const currentSpace = unref(space)
    if (!currentSpace) {
      return null
    }
    try {
      const isNew = !path
      const targetPath = isNew ? urlJoin(folderPath(), fileName) : path
      const resource = await clientService.webdav.putFileContents(currentSpace, {
        path: targetPath,
        content,
        previousEntityTag: isNew ? undefined : etag
      })
      return { fileName, path: targetPath, etag: resource.etag, content }
    } catch (e) {
      console.error('Failed to save document', e)
      showErrorMessage({ title: $gettext('Speichern fehlgeschlagen'), errors: [e] })
      return null
    }
  }

  const canWrite = computed(() => {
    const currentSpace = unref(space)
    const user = unref(userStore.user)
    if (!currentSpace || !user) {
      return false
    }
    if (typeof currentSpace.isOwner === 'function') {
      try {
        if (currentSpace.isOwner(user)) {
          return true
        }
      } catch {
        // ignore and fall through
      }
    }
    const ownerId =
      (currentSpace.owner as { user?: { id?: string }; id?: string } | undefined)?.id ??
      (currentSpace.owner as { user?: { id?: string } } | undefined)?.user?.id
    const username = user.onPremisesSamAccountName ?? user.id
    if (ownerId && (ownerId === username || String(ownerId).endsWith(username))) {
      return true
    }
    if (typeof currentSpace.canUpload === 'function') {
      try {
        const result = currentSpace.canUpload({ user })
        if (typeof result === 'boolean') {
          return result
        }
      } catch {
        // ignore and fall through
      }
    }
    if (Array.isArray(currentSpace.graphPermissions)) {
      return currentSpace.graphPermissions.some((p: string) => p.includes('createUpload'))
    }
    // Fallback: OpenCloud project spaces grant their creator write access;
    // the web client does not always expose graphPermissions, so we stay
    // optimistic here. The server still enforces permissions on write.
    return currentSpace.driveType === 'project'
  })

  return {
    loading,
    space,
    canWrite,
    loadDocuments,
    saveDocument
  }
}
