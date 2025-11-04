// Lightweight i18n service with resource bundles and locale switching
import en from './locales/en.json';
import hi from './locales/hi.json';

const bundles = { en, hi };

function getInitialLocale() {
  const stored = localStorage.getItem('locale');
  if (stored && bundles[stored]) return stored;
  const browser = (navigator.language || 'en').slice(0, 2);
  return bundles[browser] ? browser : 'en';
}

export const I18n = {
  locale: getInitialLocale(),
  t(key) {
    const b = bundles[this.locale] || bundles.en;
    return b[key] || bundles.en[key] || key;
  },
  setLocale(locale) {
    if (!bundles[locale]) return;
    this.locale = locale;
    localStorage.setItem('locale', locale);
    const event = new CustomEvent('i18n:localeChanged', { detail: { locale } });
    window.dispatchEvent(event);
  },
  getSupportedLocales() {
    return Object.keys(bundles);
  }
};

export default I18n;