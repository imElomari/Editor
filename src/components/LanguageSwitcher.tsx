import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Icons } from '../lib/constances';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common');

  const languages = [
    { code: 'en', flag: '🇬🇧' },
    { code: 'es', flag: '🇪🇸' },
    { code: 'fr', flag: '🇫🇷' },
    { code: 'ar', flag: '🇸🇦' }
  ];

  const handleLanguageChange = async (langCode: string) => {
    await i18n.changeLanguage(langCode);
    // Update document direction
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';

  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 px-2 hover:bg-accent transition-colors duration-200"
          aria-label={t('language.select')}
        >
          <Icons.global className="h-4 w-4 mr-1 text-muted-foreground" />
          <span className="text-sm font-medium uppercase">
            {t(`language.${i18n.language}`)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{lang.flag}</span>
              <span>{t(`language.${lang.code}`)}</span>
            </div>
            {lang.code === i18n.language && (
              <Icons.checkmark className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}