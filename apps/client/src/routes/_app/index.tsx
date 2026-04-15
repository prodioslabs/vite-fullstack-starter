import { createFileRoute } from '@tanstack/react-router'
import { HomeIcon } from 'lucide-react'

import { ErrorMessage } from '@/components/ui/error-message'
import { FileUploader } from '@/components/ui/file-uploader'
import { ImageUploader } from '@/components/ui/image-uploader'
import { PageHeader } from '@/components/ui/page-header'
import { Spinner } from '@/components/ui/spinner'
import { uploadFile, uploadImage } from '@/lib/upload'

export const Route = createFileRoute('/_app/')({
  component: HomePage,
  pendingComponent: () => {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2">
        <Spinner />
        <div className="text-xs text-muted-foreground">Loading...</div>
      </div>
    )
  },
  errorComponent: ({ error }) => {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <ErrorMessage title="Error loading dashboard..." error={error} />
      </div>
    )
  },
})

function HomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        icon={<HomeIcon />}
        title="Home"
        description="Examples of various UI components"
      />
      <div>
        <div className="text-sm font-medium mb-2">File Uploader</div>
        <FileUploader fileUploadHandler={uploadFile} />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Image Uploader</div>
        <ImageUploader imageUploadHandler={uploadImage} />
      </div>
    </div>
  )
}
