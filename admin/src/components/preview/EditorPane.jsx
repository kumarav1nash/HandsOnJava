import React, { memo, forwardRef } from 'react'
import Editor from '@monaco-editor/react'

const EditorPane = memo(forwardRef(({ value, onChange, language = 'java', theme = 'vs-dark', height = '100%', onRun, readOnly = false }, ref) => {
    return (
        <div className="h-full w-full overflow-hidden rounded-md border border-gray-300">
            <Editor
                height={height}
                language={language}
                theme={theme}
                value={value}
                onChange={(val) => onChange && onChange(val ?? '')}
                onMount={(editor, monaco) => {
                    if (ref) ref.current = editor;
                    // Ctrl/Cmd+Enter -> Run
                    if (monaco && editor && typeof editor.addCommand === 'function') {
                        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                            if (typeof onRun === 'function') onRun()
                        })
                    }
                }}
                options={{
                    readOnly,
                    fontSize: 14,
                    fontLigatures: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    smoothScrolling: true,
                    padding: { top: 16, bottom: 16 },
                }}
            />
        </div>
    )
}))

EditorPane.displayName = 'EditorPane'

export default EditorPane
