import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  BellIcon,
  ChevronsUpDownIcon,
  ContrastIcon,
  FolderIcon,
  FolderKanbanIcon,
  Home,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { InputGroup, InputGroupAddon } from '../ui/input-group'
import { Kbd } from '../ui/kbd'
import { Logo } from '../ui/logo'

import MenuGroup from './components/menu-group'
import NavLink from './components/nav-link'
import ShowForUserRole from './components/show-for-user-role'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { useTheme } from '@/hooks/use-theme'
import { authClient, type User } from '@/lib/auth'
import { getErrorMessage, getInitials, invariant } from '@/lib/utils'

type AppShellProps = React.PropsWithChildren<{ user: User }>

export default function AppShell({ user, children }: AppShellProps) {
  const userRole = user.role
  invariant(userRole, 'user role should be present')

  const isMobile = useIsMobile()
  const { theme, setTheme } = useTheme()

  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(function setCommandOpenShortcut() {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const signOutMutation = useMutation({
    mutationFn: () => {
      return authClient.signOut()
    },
    onSuccess: () => {
      toast.success('Signed out successfully')
      queryClient.clear()
      navigate({ to: '/login', replace: true })
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)
      toast.error('Failed to sign out', {
        description: errorMessage,
      })
    },
  })

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="floating">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/">
                  <div className="flex aspect-square size-8 items-center justify-center">
                    <Logo className="size-12" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      Vite Full Stack
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      Starter
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <ShowForUserRole roles={['USER', 'OFFICER', 'SUPER_ADMIN']}>
                  <>
                    <NavLink icon={<Home />} to="/">
                      Home
                    </NavLink>
                    <MenuGroup icon={<FolderKanbanIcon />} label="Projects">
                      <ShowForUserRole
                        roles={['USER', 'SUPER_ADMIN', 'OFFICER']}
                      >
                        <NavLink to="/projects" icon={<FolderIcon />}>
                          All Projects
                        </NavLink>
                      </ShowForUserRole>
                    </MenuGroup>
                  </>
                </ShowForUserRole>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Notifications</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <ShowForUserRole roles={['USER', 'SUPER_ADMIN', 'OFFICER']}>
                  <NavLink to="/notifications" icon={<BellIcon />}>
                    Notifications
                  </NavLink>
                </ShowForUserRole>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name}
                      />
                      <AvatarFallback className="rounded-full text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                    <ChevronsUpDownIcon className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={isMobile ? 'bottom' : 'right'}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        {user.image ? (
                          <AvatarImage src={user.image} alt={user.name} />
                        ) : null}
                        <AvatarFallback className="rounded-full text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {user.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/">Profile</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={() => setTheme('light')}
                        className={theme === 'light' ? 'bg-muted' : undefined}
                      >
                        <span className="flex-1">Light</span>
                        <SunIcon className="text-muted-foreground size-4" />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTheme('dark')}
                        className={theme === 'dark' ? 'bg-muted' : undefined}
                      >
                        <span className="flex-1">Dark</span>
                        <MoonIcon className="text-muted-foreground size-4" />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTheme('system')}
                        className={theme === 'system' ? 'bg-muted' : undefined}
                      >
                        <span className="flex-1">System</span>
                        <ContrastIcon className="text-muted-foreground size-4" />
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      signOutMutation.mutate()
                    }}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="bg-background sticky top-0 z-50 flex h-12 shrink-0 items-center gap-4 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <InputGroup
            className="w-56 cursor-pointer gap-2"
            aria-label="Search"
            role="button"
            tabIndex={0}
            onClick={() => setCommandOpen(true)}
          >
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <div className="text-muted-foreground flex-1 text-sm">
              Search...
            </div>
            <InputGroupAddon align="inline-end">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </InputGroupAddon>
          </InputGroup>
        </header>
        <main className="flex flex-1 flex-col overflow-y-auto p-4">
          {children}
        </main>
      </SidebarInset>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search for..." />
        <CommandList>
          <CommandEmpty>No results found</CommandEmpty>
          <CommandGroup heading="Theme">
            <CommandItem
              onSelect={() => {
                setTheme('light')
                setCommandOpen(false)
              }}
            >
              Light Theme
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setTheme('dark')
                setCommandOpen(false)
              }}
            >
              Dark Theme
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setTheme('system')
                setCommandOpen(false)
              }}
            >
              System Theme
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </SidebarProvider>
  )
}
