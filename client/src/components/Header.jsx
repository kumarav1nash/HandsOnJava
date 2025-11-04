import { useEffect, useState } from 'react'
import LocaleSwitcher from './LocaleSwitcher'
import { useI18n } from '../i18n/useI18n.js'
import classNames from 'classnames'

const Header = ({ onThemeToggle, theme, hasUnsavedChanges, lastSaved, isOnline }) => {
  const [saved, setSaved] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    if (!hasUnsavedChanges && lastSaved) {
      setSaved(true)
      const timer = setTimeout(() => setSaved(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasUnsavedChanges, lastSaved])

  const formatLastSaved = (date) => {
    if (!date) return ''
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <header className="app__header" role="banner">
      <div className="header__brand">
        <img 
          src="/vite.svg" 
          className="logo" 
          alt={t('header.brand_alt')} 
          role="img"
        />
        <h1 className="header__title">
          {t('header.title')}
        </h1>
      </div>
      
      <div className="spacer" />
      
      <div className="header__status">
        {/* Connection Status */}
        <div 
          className={classNames('status-indicator', {
            'status-indicator--online': isOnline,
            'status-indicator--offline': !isOnline
          })}
          title={isOnline ? t('status.connected_title') : t('status.offline_title')}
          aria-label={isOnline ? t('status.connected_aria') : t('status.offline_aria')}
        >
          <span className="status-indicator__dot" aria-hidden="true" />
          <span className="status-indicator__text">
            {isOnline ? t('status.online') : t('status.offline')}
          </span>
        </div>
        
        {/* Save Status */}
        {(hasUnsavedChanges || saved || lastSaved) && (
          <div className="save-status">
            {hasUnsavedChanges ? (
              <span 
                className="save-status__indicator save-status__indicator--unsaved"
                title="Unsaved changes"
                aria-label="You have unsaved changes"
              >
                <span className="save-status__dot" aria-hidden="true">●</span>
                <span className="save-status__text">{t('save.unsaved')}</span>
              </span>
            ) : saved ? (
              <span 
                className={classNames('save-status__indicator', 'save-status__indicator--saved', { visible: saved })}
                title={t('save.saved')}
                aria-label={t('save.saved')}
              >
                <span className="save-status__icon" aria-hidden="true">✓</span>
                <span className="save-status__text">{t('save.saved')}</span>
              </span>
            ) : lastSaved ? (
              <span 
                className="save-status__indicator save-status__indicator--timestamp"
                title={`Last saved: ${lastSaved.toLocaleString()}`}
                aria-label={`Last saved ${formatLastSaved(lastSaved)}`}
              >
                <span className="save-status__text">
                  {formatLastSaved(lastSaved)}
                </span>
              </span>
            ) : null}
          </div>
        )}
      </div>
      
      <div className="header__actions">
        <button 
          className={classNames('btn', 'btn--secondary', 'theme-toggle')}
          onClick={onThemeToggle}
          aria-label={`Switch to ${theme === 'vs-dark' ? t('theme.light') : t('theme.dark')} theme`}
          title={`Switch to ${theme === 'vs-dark' ? t('theme.light') : t('theme.dark')} theme`}
        >
          <span className="theme-toggle__icon" aria-hidden="true">
            {theme === 'vs-dark' ? '☀️' : '🌙'}
          </span>
          <span className="theme-toggle__text">
            {theme === 'vs-dark' ? t('theme.light') : t('theme.dark')}
          </span>
        </button>
        <LocaleSwitcher />
      </div>
    </header>
  )
}

export default Header