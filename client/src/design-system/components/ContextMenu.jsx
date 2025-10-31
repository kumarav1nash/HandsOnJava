import { useEffect, useRef, useState, useCallback } from 'react'

// Reusable desktop context menu with keyboard support
// Props:
// - items: Array<{ id: string, label: string, shortcut?: string, disabled?: boolean, onSelect?: () => void }>
// - children: ReactNode (the target area to attach right-click/context menu)
// - onOpenChange?: (open: boolean) => void
// - alignToCursor?: boolean (default true)
export default function ContextMenu({ items = [], children, onOpenChange, alignToCursor = true }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [activeIndex, setActiveIndex] = useState(0)
  const menuRef = useRef(null)

  const close = useCallback(() => {
    setOpen(false)
    onOpenChange?.(false)
  }, [onOpenChange])

  const onContextMenu = (e) => {
    e.preventDefault()
    const x = alignToCursor ? e.clientX : e.currentTarget.getBoundingClientRect().left + 12
    const y = alignToCursor ? e.clientY : e.currentTarget.getBoundingClientRect().top + 12
    setPos({ x, y })
    setOpen(true)
    onOpenChange?.(true)
    setActiveIndex(0)
  }

  const onKeyDownTarget = (e) => {
    // Open via Shift+F10 or Context Menu key
    if ((e.shiftKey && e.key === 'F10') || e.key === 'ContextMenu') {
      e.preventDefault()
      const rect = e.currentTarget.getBoundingClientRect()
      setPos({ x: rect.left + 12, y: rect.top + 12 })
      setOpen(true)
      onOpenChange?.(true)
      setActiveIndex(0)
    }
  }

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (open && !menuRef.current?.contains(e.target)) close()
    }
    const onDocKeyDown = (e) => {
      if (!open) return
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return
      }
      const max = items.length - 1
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(max, i + 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1))
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActiveIndex(0)
      } else if (e.key === 'End') {
        e.preventDefault();
        setActiveIndex(max)
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = items[activeIndex]
        if (item && !item.disabled) {
          item.onSelect?.()
          close()
        }
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    document.addEventListener('keydown', onDocKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      document.removeEventListener('keydown', onDocKeyDown)
    }
  }, [open, items, activeIndex, close])

  return (
    <div onContextMenu={onContextMenu} onKeyDown={onKeyDownTarget} tabIndex={0} style={{ height: '100%' }}>
      {children}
      {open && (
        <div className="ds-context-menu" ref={menuRef} style={{ left: pos.x, top: pos.y }} role="menu" aria-label="Context menu">
          <ul className="ds-context-list">
            {items.map((item, idx) => (
              <li
                key={item.id}
                role="menuitem"
                aria-disabled={item.disabled || undefined}
                aria-selected={idx === activeIndex || undefined}
                className={`ds-context-item ${item.disabled ? 'is-disabled' : ''}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => { if (!item.disabled) { item.onSelect?.(); close(); } }}
              >
                <span className="ds-context-label">{item.label}</span>
                {item.shortcut && <span className="ds-context-shortcut">{item.shortcut}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}