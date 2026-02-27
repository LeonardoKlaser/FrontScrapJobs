import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'

const languages = [
  { code: 'pt-BR', label: 'PT', flag: '\u{1F1E7}\u{1F1F7}' },
  { code: 'en-US', label: 'EN', flag: '\u{1F1FA}\u{1F1F8}' }
] as const

export function LanguageSelector() {
  const { i18n, t } = useTranslation()

  const handleChange = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('i18n-lng', lng)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Globe className="size-[1.1rem]" />
          <span className="sr-only">{t('language.label')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={i18n.language === lang.code ? 'bg-primary/10 text-primary' : ''}
          >
            {lang.flag}{' '}
            {lang.code === 'pt-BR' ? t('language.pt') : t('language.en')}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
