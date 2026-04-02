import { useQuery } from '@tanstack/react-query'
import {
  FileBoxIcon,
  RefreshCcwIcon,
  RotateCwSquare,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react'
import { useCallback, useId, useState } from 'react'
import {
  Document,
  type DocumentProps,
  Page,
  type PageProps,
  pdfjs,
} from 'react-pdf'
import { match } from 'ts-pattern'

import { Button } from '../ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
} from '../ui/pagination'
import { Spinner } from '../ui/spinner'
import { getPages } from '../ui/table-pagination'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type PDFViewerProps = DocumentProps & {
  width?: PageProps['width']
}

export default function PDFViewer({ width, file, ...props }: PDFViewerProps) {
  const [pages, setPages] = useState({
    current: 0,
    total: 0,
  })
  const [degreeOfRotation, setDegreeOfRotation] = useState<number>(0)
  const [zoom, setZoom] = useState(1)

  const changeDegreeOfRotation = useCallback(() => {
    /**
     * 0 = default, 90 = rotated to the right, 180 = upside down, 270 = rotated to the left.
     */
    setDegreeOfRotation((prev) => (prev >= 270 ? 0 : prev + 90))
  }, [])

  const zoomIn = useCallback(() => {
    setZoom((prev) => prev + 0.1)
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((prev) => prev - 0.1)
  }, [])

  const id = useId()

  const fileQuery = useQuery({
    queryKey: ['file-download', id],
    queryFn: async () => {
      if (file instanceof File) {
        return file
      }
      if (file instanceof Blob) {
        return file
      }
      if (typeof file === 'string') {
        return fetch(file, { credentials: 'include' }).then((res) => res.blob())
      }
      throw new Error('Invalid file type')
    },
    enabled: !!file,
  })

  return (
    <div>
      <div className="w-full pb-2 border-b border-primary-foreground gap-x-2 flex">
        <Button
          icon={<RefreshCcwIcon />}
          type="button"
          onClick={changeDegreeOfRotation}
          variant="outline"
        >
          Rotate
        </Button>
        <Button
          icon={<ZoomInIcon />}
          type="button"
          onClick={zoomIn}
          disabled={zoom > 2}
          variant="outline"
        />
        <span className="text-sm font-semibold p-2">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          icon={<ZoomOutIcon />}
          type="button"
          onClick={zoomOut}
          disabled={zoom < 0.5}
          variant="outline"
        />
        <Button
          icon={<RotateCwSquare />}
          type="button"
          onClick={() => {
            setZoom(1)
            setDegreeOfRotation(0)
          }}
          variant="outline"
        >
          Reset
        </Button>

        <div className="flex-1" />
        {pages.total > 1 ? (
          <Pagination className="flex flex-row">
            <PaginationContent className="flex flex-row">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => {
                    setPages((prev) => ({
                      ...prev,
                      current: prev.current - 1,
                    }))
                  }}
                  disabled={pages.current === 1}
                />
              </PaginationItem>
              {getPages(pages.current, pages.total).map((pageItem, index) => {
                return match(pageItem)
                  .returnType<React.ReactNode>()
                  .with({ type: 'item' }, ({ value }) => {
                    return (
                      <PaginationItem key={`page-${value}`}>
                        <PaginationLink
                          onClick={() => {
                            setPages((prev) => ({
                              ...prev,
                              current: value,
                            }))
                          }}
                          isActive={pages.current === value}
                        >
                          {value}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })
                  .with({ type: 'ellipsis' }, () => {
                    return (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  })
                  .exhaustive()
              })}
            </PaginationContent>
          </Pagination>
        ) : null}
      </div>
      <div className="flex items-center justify-center">
        {match(fileQuery)
          .returnType<React.ReactNode>()
          .with({ status: 'pending' }, () => {
            return (
              <div className="flex items-center justify-center w-full p-4">
                <Spinner />
              </div>
            )
          })
          .with({ status: 'error' }, () => {
            return (
              <div className="flex items-center justify-center w-full gap-2 p-4 text-base text-destructive">
                <FileBoxIcon />
                <h4 className="text-current truncate">
                  Failed to load PDF file
                </h4>
              </div>
            )
          })
          .with({ status: 'success' }, ({ data }) => {
            return (
              <Document
                rotate={degreeOfRotation}
                className="overflow-x-auto h-[80vh]"
                onLoadSuccess={(pdf) => {
                  setPages((prev) => ({
                    ...prev,
                    total: pdf.numPages,
                    current: 1,
                  }))
                }}
                {...props}
                file={data}
                loading={
                  <div className="flex items-center justify-center w-full p-4">
                    <Spinner />
                  </div>
                }
                error={
                  <div className="flex items-center justify-center w-full gap-2 p-4 text-base text-destructive">
                    <FileBoxIcon />
                    <h4 className="text-current truncate">
                      Failed to load PDF file
                    </h4>
                  </div>
                }
              >
                <Page
                  key={pages.current}
                  pageNumber={pages.current}
                  width={width}
                  scale={zoom}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
              </Document>
            )
          })
          .otherwise(() => null)}
      </div>
    </div>
  )
}
