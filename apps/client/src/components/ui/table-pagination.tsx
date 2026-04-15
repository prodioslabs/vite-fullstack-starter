import { match } from 'ts-pattern'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

import { cn, type WithBasicProps } from '@/lib/utils'

type TablePaginationProps = WithBasicProps<{
  page: number
  onPageChange?: (page: number) => void
  pageSize: number
  onPageSizeChange?: (pageSize: number) => void
  totalPages: number
  hasPreviousPage?: boolean
  onPreviousPageClick?: () => void
  hasNextPage?: boolean
  onNextPageClick?: () => void
  pageSizes?: number[]
}>

export function TablePagination({
  page,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalPages,
  hasPreviousPage,
  onPreviousPageClick,
  hasNextPage,
  onNextPageClick,
  pageSizes = [5, 10, 20, 30, 40, 50],
  className,
  style,
}: TablePaginationProps) {
  return (
    <div
      className={cn('flex items-start justify-end space-x-8', className)}
      style={style}
    >
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={onPreviousPageClick}
              disabled={!hasPreviousPage}
            />
          </PaginationItem>
          {getPages(page, totalPages).map((pageItem, index) => {
            return match(pageItem)
              .returnType<React.ReactNode>()
              .with({ type: 'item' }, ({ value }) => {
                return (
                  <PaginationItem key={`page-${value}`}>
                    <PaginationLink
                      onClick={() => {
                        onPageChange?.(value)
                      }}
                      isActive={page === value}
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
          <PaginationItem>
            <PaginationNext onClick={onNextPageClick} disabled={!hasNextPage} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <Select
        value={pageSize.toString()}
        onValueChange={(pageCountSelected) => {
          onPageSizeChange?.(Number.parseInt(pageCountSelected, 10))
        }}
      >
        <SelectTrigger className="w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pageSizes.map((_pageSize) => {
            return (
              <SelectItem value={_pageSize.toString()} key={_pageSize}>
                {_pageSize} / page
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}

type PageData =
  | {
      type: 'item'
      value: number
    }
  | {
      type: 'ellipsis'
    }

export function getPages(
  activePage: number,
  totalPages: number,
  pageRangeDisplayed: number = 2,
  boundaryPageButtons: number = 1,
): PageData[] {
  const items: PageData[] = []

  if (totalPages <= pageRangeDisplayed) {
    for (let page = 1; page <= totalPages; page++) {
      items.push({
        type: 'item',
        value: page,
      })
    }
  } else {
    // Number of buttons to render on the left side of selected button
    let leftSide = pageRangeDisplayed / 2

    // Number of buttons to render on the right side of selected button
    let rightSide = pageRangeDisplayed - leftSide

    // If the selected page index is on the default right side of the pagination,
    // we consider that the new right side is made up of it (= only one break element).
    // If the selected page index is on the default left side of the pagination,
    // we consider that the new left side is made up of it (= only one break element).
    if (activePage > totalPages - pageRangeDisplayed / 2) {
      rightSide = totalPages - activePage
      leftSide = pageRangeDisplayed - rightSide
    } else if (activePage < pageRangeDisplayed / 2) {
      leftSide = activePage
      rightSide = pageRangeDisplayed - leftSide
    }

    for (let page = 1; page <= totalPages; page++) {
      // If the page index is lower than
      // the number of boundary buttons defined,
      // the page has to be displayed on the left side of
      // the pagination.
      if (page <= boundaryPageButtons) {
        items.push({
          type: 'item',
          value: page,
        })
        continue
      }

      // If the page index is greater than the total pages
      // minus the number of boundary buttons defined,
      // the page has to be displayed on the right side of the pagination.
      if (page > totalPages - boundaryPageButtons) {
        items.push({
          type: 'item',
          value: page,
        })
        continue
      }

      // If the page index is near the activePage page index
      // and inside the defined range (pageRangeDisplayed)
      // we have to display it (it will create the center
      // part of the pagination).
      if (page >= activePage - leftSide && page <= activePage + rightSide) {
        items.push({
          type: 'item',
          value: page,
        })
        continue
      }

      // If the page index doesn't meet any of the conditions above,
      // we check if the last item of the current "items" array
      // is a break element. If not, we add a break element, else,
      // we do nothing (because we don't want to display the page).
      if (items[items.length - 1].type !== 'ellipsis') {
        items.push({
          type: 'ellipsis',
        })
      }
    }
  }
  return items
}
