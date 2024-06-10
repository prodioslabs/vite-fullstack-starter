import { DropzoneOptions, useDropzone } from 'react-dropzone'
import { UploadIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

type UploaderProps = DropzoneOptions & {
  description?: string
  className?: string
  style?: React.CSSProperties
}

export function Uploader({ description, className, style, ...options }: UploaderProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    ...options,
  })

  return (
    <div
      className={cn(
        'h-40 rounded-md border p-4',
        {
          'border-dashed': !isDragActive,
          'border-border bg-muted shadow-inner': isDragActive,
          'cursor-not-allowed opacity-50': options.disabled,
        },
        className,
      )}
      style={style}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <div className="flex h-full flex-col items-center justify-center">
        <UploadIcon className="mb-2 h-6 w-6 text-muted-foreground" />
        <div className="text-sm text-muted-foreground text-center">
          {isDragActive ? (
            <>Drop the files here ...</>
          ) : (
            <>
              Drag &apos;n&apos; drop <span className="font-medium text-foreground">some files</span> here, or click to
              select files
            </>
          )}
        </div>
        {description ? <div className="mt-2 text-xs uppercase text-muted-foreground">{description}</div> : null}
      </div>
    </div>
  )
}
