import { useMutation } from '@tanstack/react-query'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { cn, getErrorMessage } from '../../lib/utils'

import { FilePreview } from './file-preview'
import { Spinner } from './spinner'
import { Uploader } from './uploader'

type FileData = { mimeType?: string; size?: number } & Record<string, any>

type FileUploaderProps = React.ComponentProps<typeof Uploader> & {
  value?: File | FileData | null
  onValueChange?: (file: File | FileData | null) => void
  fileUploadHandler?: (
    file: File,
    onUploadProgress?: (args: { progress?: number }) => void,
  ) => Promise<FileData>
  getPreviewUrl?: (file: FileData) => string
}

export function FileUploader({
  value,
  onValueChange,
  fileUploadHandler,
  getPreviewUrl,
  className,
  style,
  ...props
}: FileUploaderProps) {
  const [progress, setProgress] = useState(0)

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File | null) => {
      if (fileUploadHandler && file) {
        return fileUploadHandler(file, ({ progress }) => {
          setProgress(progress ?? 0)
        })
      }
      return file
    },
    onSuccess: (data) => {
      toast.success('File uploaded successfully')
      onValueChange?.(data)
    },
    onError: (error) => {
      toast.error('Error uploading image', {
        description: getErrorMessage(error),
      })
    },
  })

  return (
    <div
      className={cn(
        'relative cursor-pointer overflow-hidden rounded-md',
        className,
      )}
      style={style}
    >
      {progress !== 0 && progress !== 1 ? (
        <div className="absolute left-0 right-0 top-0 h-1 overflow-hidden rounded-full">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      ) : null}
      <Uploader
        {...props}
        onDropAccepted={(files) => {
          uploadFileMutation.mutate(files[0])
        }}
      />
      {uploadFileMutation.isPending ? (
        <Spinner className="absolute right-3 top-3 h-4 w-4" />
      ) : null}
      {value ? (
        <div className="relative mt-2">
          <FilePreview
            file={
              value instanceof File
                ? value
                : (value.url ?? getPreviewUrl?.(value))
            }
            mimeType={value instanceof File ? undefined : value.mimeType}
            hideExtraActions={false}
          />
          <button
            onClick={() => {
              if (props.disabled) {
                return
              }
              uploadFileMutation.mutate(null)
            }}
            type="button"
            className="bg-card text-card-foreground absolute top-1 left-6 p-1 rounded flex items-center justify-center"
          >
            <XIcon
              className={cn(
                'w-3 h-3',
                { 'cursor-not-allowed opacity-50': props.disabled },
                className,
              )}
            />
          </button>
        </div>
      ) : null}
    </div>
  )
}
