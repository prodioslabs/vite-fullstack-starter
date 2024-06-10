import { FileIcon, FileSpreadsheetIcon, LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

type FilePreviewProps = {
  file: File | string
  mimeType?: string
  className?: string
  style?: React.CSSProperties
}

export function FilePreview({ file, mimeType, className, style }: FilePreviewProps) {
  const fileName = typeof file === 'string' ? file : file.name

  let fileUrl: string | undefined
  if (file instanceof File && file.type.startsWith('image/')) {
    fileUrl = URL.createObjectURL(file)
  } else if (typeof file === 'string' && mimeType?.startsWith('image/')) {
    fileUrl = file
  }

  let icon: React.ReactNode
  if (fileUrl) {
    icon = <img src={fileUrl} className="w-12 h-12 object-cover rounded-md" />
  } else {
    const FileIcon = MIME_TYPE_ICONS[mimeType ?? ''] ?? FileSpreadsheetIcon
    icon = <FileIcon className="w-12 h-12 text-muted-foreground" strokeWidth={1.25} />
  }

  return (
    <div className={cn('flex items-center gap-2', className)} style={style}>
      {icon}
      <div className="max-w-40 truncate space-y-1 text-foreground text-xs">
        <div className="truncate">{fileName}</div>
        {mimeType ? <div className="text-muted-foreground uppercase">{mimeType}</div> : null}
      </div>
    </div>
  )
}

const MIME_TYPE_ICONS: Record<string, LucideIcon> = {
  'application/pdf': FileIcon,
}
