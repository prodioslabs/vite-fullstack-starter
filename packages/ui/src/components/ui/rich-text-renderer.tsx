import React, { Fragment, useCallback } from 'react'
import { match } from 'ts-pattern'
import { RichText } from '@repo/contract'
import Markdown from 'react-markdown'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from './dialog'

type RichTextRendererProps = {
  content: RichText | RichText[]
  className?: string
  style?: React.CSSProperties
}

export function RichTextRenderer({ content, className, style }: RichTextRendererProps) {
  const renderRichTextItem = useCallback((item: RichText) => {
    if (typeof item === 'string') {
      return item
    }

    return match(item)
      .returnType<React.ReactNode>()
      .with({ type: 'info' }, ({ content, info }) => {
        return (
          <Dialog>
            <DialogTrigger className="underline font-bold">{content}</DialogTrigger>
            <DialogContent className="max-h-[70vh] overflow-auto max-w-screen-lg">
              <div className="text-sm text-muted-foreground">
                <DialogTitle className="mb-4 text-2xl font-bold">{content}</DialogTitle>
                <Markdown className="prose max-w-screen-lg ">{info.trim()}</Markdown>
              </div>
            </DialogContent>
          </Dialog>
        )
      })
      .otherwise(() => null)
  }, [])

  return (
    <div className={className} style={style}>
      {Array.isArray(content) ? (
        <>
          {content.map((item, index) => {
            return <Fragment key={index}>{renderRichTextItem(item)} </Fragment>
          })}
        </>
      ) : (
        renderRichTextItem(content)
      )}
    </div>
  )
}
