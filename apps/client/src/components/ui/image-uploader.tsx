import { useMutation } from '@tanstack/react-query'
import { XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import 'react-image-crop/dist/ReactCrop.css'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
} from 'react-image-crop'
import { toast } from 'sonner'

import { cn, getErrorMessage } from '../../lib/utils'

import { Button } from './button'
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog'
import { FilePreview } from './file-preview'
import { Spinner } from './spinner'
import { Uploader } from './uploader'

type FileData = { mimeType?: string } & Record<string, any>

const MAX_FILE_SIZE_IN_BYTES = 1024 * 1024 // 1 MB

type ImageUploaderProps = React.ComponentProps<typeof Uploader> & {
  value?: File | FileData | null
  onValueChange?: (file: File | FileData | null) => void
  imageUploadHandler?: (
    file: File,
    crop: {
      unit: '%' | 'px'
      width: number
      height: number
      x: number
      y: number
    },
    onUploadProgress?: (args: { progress?: number }) => void,
  ) => Promise<FileData>
  getPreviewUrl?: (file: FileData) => string
}

export function ImageUploader({
  value,
  onValueChange,
  imageUploadHandler,
  getPreviewUrl,
  className,
  style,
  ...props
}: ImageUploaderProps) {
  const [progress, setProgress] = useState(0)

  const [file, setFile] = useState<File | null>(null)
  const fileUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : undefined),
    [file],
  )
  const [crop, setCrop] = useState<Crop>()

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File | null) => {
      if (imageUploadHandler && file && crop) {
        return imageUploadHandler(file, crop, ({ progress }) => {
          setProgress(progress ?? 0)
        })
      }
      return file
    },
    onSuccess: (result) => {
      toast.success('Image uploaded successfully')
      onValueChange?.(result)
      setFile(null)
    },
    onError: (error) => {
      toast.error('Error uploading image', {
        description: getErrorMessage(error),
      })
    },
  })

  return (
    <>
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
          onDropAccepted={async (files) => {
            const file = files[0]
            if (file.size > MAX_FILE_SIZE_IN_BYTES) {
              toast.error('File size exceeded', {
                description: 'Maximum file size of 1MB is allowed',
              })
            } else {
              const { width, height } = await getImageSize(file)
              const crop = centerCrop(
                makeAspectCrop({ unit: '%', width: 50 }, 1, width, height),
                width,
                height,
              )
              setCrop(crop)
              setFile(file)
            }
          }}
          accept={{
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
          }}
        />
        {uploadImageMutation.isPending ? (
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
      <Dialog
        open={!!file}
        onOpenChange={(open) => {
          if (!open) {
            setFile(null)
            setCrop(undefined)
          }
        }}
      >
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
            <DialogDescription>
              Crop the image for better clarity
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center rounded-md overflow-hidden">
            {fileUrl ? (
              <ReactCrop
                crop={crop}
                onChange={setCrop}
                onComplete={(_, value) => {
                  setCrop(value)
                }}
                aspect={1}
                className="max-h-[400px]"
              >
                <img src={fileUrl} />
              </ReactCrop>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                uploadImageMutation.mutate(file)
              }}
              loading={uploadImageMutation.isPending}
              disabled={uploadImageMutation.isPending}
            >
              Upload
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

async function getImageSize(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = function () {
      const img = new Image()
      img.onload = function () {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = reject
      img.src = fileReader.result as string
    }
    fileReader.readAsDataURL(file)
  })
}
