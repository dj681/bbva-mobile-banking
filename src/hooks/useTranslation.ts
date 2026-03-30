import { useAppSelector } from '@/store';
import { TRANSLATIONS, type Translations } from '@/i18n/translations';

const FALLBACK_LOCALE = 'en';

export const useTranslation = (): { t: (key: keyof Translations) => string; language: string } => {
  const language = useAppSelector((s) => s.ui.language);

  const t = (key: keyof Translations): string => {
    const dict = TRANSLATIONS[language] ?? TRANSLATIONS[FALLBACK_LOCALE];
    return (dict[key] ?? TRANSLATIONS[FALLBACK_LOCALE][key] ?? key) as string;
  };

  return { t, language };
};
