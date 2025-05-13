'use client'

import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose } from './ui/drawer'
import { Icons } from '@/lib/constances'
import { cn } from '@/lib/utils'
import React from 'react'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common')
  const isRTL = i18n.language === 'ar'

  const languages = [
    {
      code: 'en',
      name: () => t('language.en'),
      nativeName: 'English',
      flag: '🇬🇧',
    },
    {
      code: 'es',
      name: () => t('language.es'),
      nativeName: 'Español',
      flag: '🇪🇸',
    },
    {
      code: 'fr',
      name: () => t('language.fr'),
      nativeName: 'Français',
      flag: '🇫🇷',
    },
    {
      code: 'ar',
      name: () => t('language.ar'),
      nativeName: 'العربية',
      flag: '🇸🇦',
    },
  ]

  const handleLanguageChange = async (langCode: string) => {
    await i18n.changeLanguage(langCode)
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr'
  }

  const currentLanguage = languages.find((lang) => lang.code === i18n.language)

  // Desktop version
  const DesktopLanguageSelector = () => (
    <div className="hidden sm:block">
      <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}
          >
            <Icons.global className="h-5 w-5" />
            <span className="uppercase">{currentLanguage?.code}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={isRTL ? 'start' : 'end'}
          className={cn('w-48', isRTL && 'rtl')}
          side={isRTL ? 'left' : 'right'}
        >
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                'flex items-center justify-between',
                isRTL ? 'flex-row-reverse justify-start' : 'justify-between'
              )}
            >
              <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <span>{lang.flag}</span>
                <span>{lang.name()}</span>
                <span className="text-xs text-muted-foreground">({lang.nativeName})</span>
              </div>
              {lang.code === i18n.language && (
                <Icons.checkmark className={cn('h-5 w-5', isRTL ? 'ml-auto' : 'mr-auto')} />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  // Mobile version
  const MobileLanguageSelector = () => (
    <div className="sm:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}
          >
            <Icons.global className="h-5 w-5" />
            <span className="uppercase">{currentLanguage?.code}</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="grid gap-4 p-4">
            <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
              <h3 className="text-lg font-medium">{t('language.select')}</h3>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Icons.close className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
            <div className="grid gap-2">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant="ghost"
                  className={cn('justify-start gap-2', isRTL && 'flex-row-reverse')}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name()}</span>
                  <span className="text-xs text-muted-foreground">({lang.nativeName})</span>
                  {lang.code === i18n.language && (
                    <Icons.checkmark className={cn('h-5 w-5', isRTL ? 'mr-auto' : 'ml-auto')} />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )

  return (
    <React.Fragment>
      <DesktopLanguageSelector />
      <MobileLanguageSelector />
    </React.Fragment>
  )
}
