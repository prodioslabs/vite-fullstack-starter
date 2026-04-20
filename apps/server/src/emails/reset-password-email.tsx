import {
  Button,
  Container,
  Font,
  Heading,
  Html,
  Link,
  Tailwind,
  Text,
} from '@react-email/components'

type ResetPasswordEmailProps = {
  email: string
  resetUrl: string
}

export default function ResetPasswordEmail({
  email,
  resetUrl,
}: ResetPasswordEmailProps) {
  return (
    <Tailwind>
      <Html className="font-sans">
        <Font
          fontFamily="Geist"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: 'https://fonts.gstatic.com/s/geist/v3/gyByhwUxId8gMEwcGFU.woff2',
            format: 'woff2',
          }}
        />
        <Container className="bg-white p-10 max-w-lg mx-auto">
          <Heading as="h1" className="text-gray-900 text-2xl font-semibold">
            Reset your password
          </Heading>
          <Text className="text-gray-600 text-base">Hi {email},</Text>
          <Text className="text-gray-600 text-base">
            We received a request to reset your password. Click the button below
            to choose a new one. This link expires in 1 hour.
          </Text>
          <Button
            href={resetUrl}
            className="bg-gray-900 text-white font-semibold px-6 py-3 rounded-lg mt-2 block text-center"
          >
            Reset Password
          </Button>
          <Text className="text-gray-500 text-sm mt-6">
            Or copy and paste this URL into your browser:{' '}
            <Link href={resetUrl} className="text-gray-900 underline">
              {resetUrl}
            </Link>
          </Text>
          <Text className="text-gray-400 text-xs mt-6">
            If you didn't request a password reset, you can safely ignore this
            email.
          </Text>
        </Container>
      </Html>
    </Tailwind>
  )
}
