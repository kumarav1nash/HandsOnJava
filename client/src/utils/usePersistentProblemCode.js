import { useEffect, useRef, useState } from 'react'

export default function usePersistentProblemCode(problemId, initialValue = '', keyPrefix = 'playground_code') {
  const [code, setCode] = useState(initialValue)
  const debounceRef = useRef(null)

  // Load persisted code whenever problemId changes
  useEffect(() => {
    if (!problemId) return
    const saved = localStorage.getItem(`${keyPrefix}_${problemId}`)
    setCode(saved != null ? saved : initialValue)
  }, [problemId, initialValue, keyPrefix])

  // Persist on changes with light debounce
  useEffect(() => {
    if (!problemId) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`${keyPrefix}_${problemId}`, code)
      } catch (_) {
        // ignore storage write errors
      }
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [code, problemId, keyPrefix])

  return [code, setCode]
}