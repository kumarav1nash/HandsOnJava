import { useEffect } from 'react'

/**
 * Registers keyboard shortcuts like "Shift+G" to handlers.
 * - bindings: Array of { combo: string, handler: Function, preventDefault?: boolean }
 * - enabled: boolean flag to enable/disable listener
 */
export default function useKeyboardShortcuts(bindings = [], enabled = true) {
  useEffect(() => {
    if (!enabled || !Array.isArray(bindings) || bindings.length === 0) return

    const normalize = (e) => {
      const parts = []
      if (e.ctrlKey) parts.push('Ctrl')
      if (e.metaKey) parts.push('Meta')
      if (e.altKey) parts.push('Alt')
      if (e.shiftKey) parts.push('Shift')
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key
      parts.push(key)
      return parts.join('+')
    }

    const map = new Map()
    bindings.forEach(({ combo, handler, preventDefault = true }) => {
      if (typeof combo === 'string' && typeof handler === 'function') {
        map.set(combo, { handler, preventDefault })
      }
    })

    const onKeyDown = (e) => {
      // avoid capturing when typing in inputs, textareas, or contenteditable
      const target = e.target
      const tag = target?.tagName?.toLowerCase()
      const isEditable = target?.isContentEditable
      if (tag === 'input' || tag === 'textarea' || isEditable) return

      const combo = normalize(e)
      const bound = map.get(combo)
      if (bound) {
        if (bound.preventDefault) e.preventDefault()
        bound.handler()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, JSON.stringify(bindings)])
}