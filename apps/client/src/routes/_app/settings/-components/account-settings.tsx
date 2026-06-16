import { SettingsSection } from './settings-section'
import UpdatePasswordForm from './update-password-form'

import { Separator } from '@/components/ui/separator'

export default function AccountSettings() {
  return (
    <div className="flex flex-col gap-12">
      <SettingsSection
        title="Personal Information"
        description="Update your profile photo and personal details."
      />
      <Separator />
      <SettingsSection
        title="Update Password"
        description="Change your password to keep your account secure."
      >
        <UpdatePasswordForm />
      </SettingsSection>
    </div>
  )
}
