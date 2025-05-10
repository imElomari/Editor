import { useTranslation } from 'react-i18next'

export function LoadingTranslations({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()

  if (!i18n.isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">Loading translations...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
