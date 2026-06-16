# Composition over variant switches

When two surfaces share **behavior** (e.g. Markdown body, edits, uploads, **`listIssueComments`**) but differ in **chrome and actions** (thread resolve + nested replies vs inline reply menu + delete), **do not** default to one mega-component that takes **`variant: 'thread' | 'reply'`** and branches at the root with **`switch`** / early **`return`** between inner "entities". That tends to duplicate **`useMutation`** instances, splits **`isPending`** across Parents and Children, and entangles unrelated layout.

## Prefer

1. A **file-local base** that owns the shared interactive surface — e.g. **`CommentMessageBody`** in **`src/app/.../issue/[issueId]/components/comment/comment.tsx`**: author + read/edit markdown + attachment rows; takes **`updateComment`** from the parent so thread-level actions (resolve) and body edits share one mutation handle when they must stay in sync.
2. **`actions`** as a **render prop** (or **`children`**) so each wrapper passes the right menu: **`actions={({ beginEdit }) => <ThreadActionsMenu onEdit={beginEdit} ... />}`** vs a reply **`DropdownMenu`**.
3. **Separate exports** for each product surface: **`export function Comment`** (thread card, resolved shell, maps **`CommentReply`**) and **`export function CommentReply`** (reply row + delete dialog), each composing the base — no top-level **`variant`** router.

## Illustrative shape

Names trimmed; adapt paths to this project's colocation rules (`-components/`, `src/components/<name>/`).

```tsx
function CommentMessageBody({
  comment,
  updateComment,
  actions,
  editPlaceholder,
  saveToast,
}: {
  comment: CommentBodyRow
  updateComment: IssueCommentUpdateMutationHandle
  actions: (api: { beginEdit: () => void }) => React.ReactNode
  editPlaceholder: string
  saveToast: { loading: string; success: string; errorDefault: string }
}) {
  /* useForm, Controller, FileUploader, MarkdownEditor, CommentAttachmentRows */
}

export function Comment(props: CommentProps) {
  const updateComment = useIssueCommentUpdateMutation(...)
  return (
    <ThreadCard>
      <CommentMessageBody
        comment={props.comment}
        updateComment={updateComment}
        editPlaceholder="Edit comment..."
        saveToast={{ loading: '…', success: '…', errorDefault: '…' }}
        actions={({ beginEdit }) => (
          <ThreadActionsMenu onEdit={beginEdit} isUpdatePending={updateComment.isPending} ... />
        )}
      />
      {props.replies.map((r) => (
        <CommentReply key={r.id} comment={r} ... />
      ))}
    </ThreadCard>
  )
}

export function CommentReply(props: CommentReplyProps) {
  const updateComment = useIssueCommentUpdateMutation(...)
  return (
    <div className="group/reply ...">
      <CommentMessageBody
        comment={props.comment}
        updateComment={updateComment}
        editPlaceholder="Edit reply..."
        saveToast={{ loading: '…', success: '…', errorDefault: '…' }}
        actions={({ beginEdit }) =>
          props.canEditDelete ? (
            <ReplyActionsMenu onEdit={beginEdit} ... />
          ) : null
        }
      />
      <DeleteCommentAlertDialog ... />
    </div>
  )
}
```

## Avoid

Same file growing a discriminated union and dispatch:

```tsx
export function Comment(props: CommentProps | CommentReplyProps) {
  if (props.variant === 'reply') {
    return <CommentReplyBranch {...props} />
  }
  return <CommentThreadBranch {...props} />
}
```

## When `variant` is OK

Use **`variant`** only when branches are **trivially the same tree** with small styling differences — not when hooks, mutation scope, or surrounding layout diverge.

| Situation | Approach |
|-----------|----------|
| Same tree, different `className` / size | `variant` prop on a primitive or layout wrapper |
| Shared body + different chrome/actions | file-local base + render prop + separate exports |
| Different mutation scope or layout shells | separate exported components |

## Colocation

Keep the file-local base in the same file or directory as its wrappers — do not promote to `src/components/` until a second page or feature needs it. See [project-structure.md](./project-structure.md).
