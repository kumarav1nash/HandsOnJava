import React from 'react';
import { useI18n } from '../i18n/useI18n.js';

export default function LocaleSwitcher() {
  const { t, locale, setLocale } = useI18n();
  const options = [
    { value: 'en', label: t('locale.en') },
    { value: 'hi', label: t('locale.hi') }
  ];

  return (
    <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <span>{t('locale.switch.label')}</span>
      <select value={locale} onChange={(e) => setLocale(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}