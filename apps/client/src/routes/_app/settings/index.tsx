import { createFileRoute, Link } from '@tanstack/react-router'
import { SettingsIcon } from 'lucide-react'
import * as z from 'zod'

import AccountSettings from './-components/account-settings'
import SecuritySettings from './-components/security-settings'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { PageContainer } from '@/components/ui/page-container'
import { PageHeader } from '@/components/ui/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const settingsSearchSchema = z.object({
  tab: z.enum(['account', 'security']).default('account'),
})

export const Route = createFileRoute('/_app/settings/')({
  validateSearch: settingsSearchSchema,
  component: SettingsPage,
})

function SettingsPage() {
  const { tab } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <PageContainer>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader
        icon={<SettingsIcon />}
        title="Settings"
        description="Manage your account and preferences"
      />
      <Tabs
        value={tab}
        onValueChange={(nextTab) => {
          navigate({
            search: { tab: nextTab as 'account' | 'security' },
          })
        }}
      >
        <TabsList variant="line">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
