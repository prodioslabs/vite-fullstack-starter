import {
  DownloadIcon,
  EyeIcon,
  FileIcon,
  FileSpreadsheetIcon,
  type LucideIcon,
} from 'lucide-react'
import { match, P } from 'ts-pattern'

import { cn } from '../../lib/utils'
import PDFViewer from '../pdf-viewer'

import { Button } from './button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog'

type FilePreviewProps = {
  file: File | string
  mimeType?: string
  className?: string
  style?: React.CSSProperties
  hideExtraActions?: boolean
}

export function FilePreview({
  file,
  mimeType,
  className,
  style,
  hideExtraActions,
}: FilePreviewProps) {
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
    icon = (
      <FileIcon
        className="w-12 h-12 text-muted-foreground"
        strokeWidth={1.25}
      />
    )
  }

  const handleDownload = () => {
    if (typeof file === 'string') {
      window.open(file, '_blank')
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)} style={style}>
      {icon}
      <div className="max-w-40 truncate space-y-1 text-foreground text-xs">
        <div className="truncate">{fileName}</div>
        {mimeType ? (
          <div className="text-muted-foreground uppercase">{mimeType}</div>
        ) : null}
      </div>
      <div className="flex gap-2">
        {!hideExtraActions ? (
          <>
            <Button
              onClick={handleDownload}
              size="sm"
              icon={<DownloadIcon />}
              type="button"
              className="print:hidden"
            />

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  icon={<EyeIcon />}
                  type="button"
                  className="print:hidden"
                />
              </DialogTrigger>

              <DialogContent className="max-w-screen-lg overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Preview</DialogTitle>
                </DialogHeader>

                {match(mimeType)
                  .with(P.string.startsWith('image/'), () => (
                    <div className="flex items-center justify-center w-full h-full">
                      <img
                        src={fileUrl}
                        className="object-contain w-[70%] h-[70%]"
                      />
                    </div>
                  ))
                  .with('application/pdf', () => {
                    return <PDFViewer file={file} width={500} />
                  })

                  .otherwise(() => {
                    return (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Preview not available
                      </div>
                    )
                  })}
              </DialogContent>
            </Dialog>
          </>
        ) : null}
      </div>
    </div>
  )
}

const MIME_TYPE_ICONS: Record<string, LucideIcon> = {
  'application/pdf': FileIcon,
}
