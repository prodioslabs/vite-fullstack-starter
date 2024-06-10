import { RefObject } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Button } from '../../ui/button'

type DownloadDetailsProps = {
  detailsContainerRef: RefObject<HTMLDivElement>
}

export function DownloadDetails({ detailsContainerRef }: DownloadDetailsProps) {
  const handlePrint = useReactToPrint({
    content: () => detailsContainerRef.current,
    copyStyles: true,
    pageStyle: '@page {size: A4}',
    bodyClass: 'p-10',
    removeAfterPrint: true,
    suppressErrors: true,
    documentTitle: 'Form Details',
  })

  return (
    <span className="hidden md:block">
      <Button onClick={handlePrint}>Download Details</Button>
    </span>
  )
}
