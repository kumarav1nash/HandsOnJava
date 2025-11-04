import React, { createContext, useEffect, useMemo, useState } from 'react';
import I18n from './index.js';

export const I18nContext = createContext({
  t: (k) => k,
  locale: 'en',
  setLocale: () => {}
});

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(I18n.locale);

  useEffect(() => {
    function onChange(e) {
      setLocaleState(e.detail.locale);
    }
    window.addEventListener('i18n:localeChanged', onChange);
    return () => window.removeEventListener('i18n:localeChanged', onChange);
  }, []);

  const value = useMemo(() => ({
    t: (key) => I18n.t(key),
    locale,
    setLocale: (l) => I18n.setLocale(l)
  }), [locale]);

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export default LocaleProvider;