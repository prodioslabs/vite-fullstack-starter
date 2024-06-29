'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Switch } from '@repo/ui'
import ThemeToggle from './theme-toggle'

export default function AppShell({ children }: React.PropsWithChildren) {
  const lang = useParams<{ lang: string }>().lang
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div>
      <div className="sticky top-0 z-navbar">
        <div className="border-b bg-muted">
          <div className="container flex items-center py-1.5">
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div>English</div>
              <Switch
                size="sm"
                checked={lang === 'hi'}
                onCheckedChange={(value) => {
                  const newPath = pathname.replace(lang, value ? 'hi' : 'en')
                  router.replace(newPath)
                }}
              />
              <div>Hindi</div>
            </div>
          </div>
        </div>
        <div className="border-b bg-background">
          <div className="container flex items-center gap-4 py-4 text-foreground">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary" />
              <div className="text-lg font-medium tracking-tight">Landing page</div>
            </Link>

            <div className="flex-1" />

            <Link href="/">About</Link>

            <Link href="/">Contact Us</Link>

            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="min-h-screen">{children}</div>
      <div className="bg-primary text-primary-foreground">
        <div className="container grid grid-cols-3 gap-4 py-4 text-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-current" />
              <div>Next Starter</div>
            </div>
            <div>© Copyright 2024</div>
          </div>

          <div className="space-y-4">
            <Link className="block" href="/">
              Home
            </Link>
            <Link className="block" href="/">
              About
            </Link>
            <Link className="block" href="/">
              Contact Us
            </Link>
          </div>

          <div className="space-y-4">
            <Link className="block" href="/">
              Login
            </Link>
            <Link className="block" href="/">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
