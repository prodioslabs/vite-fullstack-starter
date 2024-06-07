import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { XIcon } from 'lucide-react'
import { Uploader } from './uploader'
import { cn } from '../../lib/utils'
import { Spinner } from './spinner'
import { FilePreview } from './file-preview'

type FileData = { mimeType?: string } & Record<string, any>

type FileUploaderProps = React.ComponentProps<typeof Uploader> & {
  value?: File | FileData | null
  onValueChange?: (file: File | FileData | null) => void
  imageUploadHandler?: (file: File, onUploadProgress?: (args: { progress?: number }) => void) => Promise<FileData>
  getPreviewUrl?: (file: FileData) => string
}

export function FileUploader({
  value,
  onValueChange,
  imageUploadHandler,
  getPreviewUrl,
  className,
  style,
  ...props
}: FileUploaderProps) {
  const [progress, setProgress] = useState(0)

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File | null) => {
      if (imageUploadHandler && file) {
        return imageUploadHandler(file, ({ progress }) => {
          setProgress(progress ?? 0)
        })
      }
      return file
    },
    onSuccess: onValueChange,
  })

  return (
    <div className={cn('relative cursor-pointer overflow-hidden rounded-md', className)} style={style}>
      {progress !== 0 && progress !== 1 ? (
        <div className="absolute left-0 right-0 top-0 h-1 overflow-hidden rounded-full">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
      ) : null}
      <Uploader
        {...props}
        onDropAccepted={(files) => {
          uploadImageMutation.mutate(files[0])
        }}
      />
      {uploadImageMutation.isPending ? <Spinner className="absolute right-3 top-3 h-4 w-4" /> : null}
      {value ? (
        <div className="relative mt-2">
          <FilePreview
            file={value instanceof File ? value : value.url ?? getPreviewUrl?.(value)}
            mimeType={value instanceof File ? undefined : value.mimeType}
          />
          <button
            onClick={() => {
              uploadImageMutation.mutate(null)
            }}
            type="button"
            className="bg-card text-card-foreground absolute top-1 left-6 p-1 rounded flex items-center justify-center"
          >
            <XIcon className="w-3 h-3" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
