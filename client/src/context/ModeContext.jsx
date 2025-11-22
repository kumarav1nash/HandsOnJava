import { createContext, useContext, useState, useEffect } from 'react'

const ModeContext = createContext()

export function ModeProvider({ children }) {
    const [mode, setMode] = useState(() => {
        try {
            return localStorage.getItem('app_mode') || 'learn'
        } catch {
            return 'learn'
        }
    })

    useEffect(() => {
        try {
            localStorage.setItem('app_mode', mode)
            document.documentElement.setAttribute('data-mode', mode)
        } catch { }
    }, [mode])

    const toggleMode = () => {
        setMode(prev => prev === 'learn' ? 'practice' : 'learn')
    }

    return (
        <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
            {children}
        </ModeContext.Provider>
    )
}

export function useMode() {
    const context = useContext(ModeContext)
    if (!context) {
        throw new Error('useMode must be used within a ModeProvider')
    }
    return context
}
