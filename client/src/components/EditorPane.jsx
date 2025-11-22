import { memo, forwardRef } from 'react'
import Editor from '@monaco-editor/react'

const EditorPane = memo(forwardRef(({ value, onChange, language = 'java', theme = 'vs-dark', height = '100%', onRun, onSubmit, readOnly = false }, ref) => {
  return (
    <div className="editor" style={{ height: '100%' }}>
      <Editor
        height={height}
        language={language}
        theme={theme}
        value={value}
        onChange={(val) => onChange(val ?? '')}
        onMount={(editor, monaco) => {
          if (ref) ref.current = editor;
          // Ctrl/Cmd+Enter -> Run
          if (monaco && editor && typeof editor.addCommand === 'function') {
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
              if (typeof onRun === 'function') onRun()
            })
            // Ctrl/Cmd+Shift+Enter -> Submit
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
              if (typeof onSubmit === 'function') onSubmit()
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
        }}
      />
    </div>
  )
}))

export default EditorPane