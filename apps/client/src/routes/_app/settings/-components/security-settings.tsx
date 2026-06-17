import { SettingsSection } from './settings-section'
import TwoFactorAuthenticationForm from './two-factor-authentication-form'

export default function SecuritySettings() {
  return (
    <SettingsSection
      title="Security"
      description="Protect your account with an authenticator app and one-time passcodes. Only available when you sign in with email and password."
    >
      <TwoFactorAuthenticationForm />
    </SettingsSection>
  )
}
