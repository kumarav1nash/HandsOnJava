import { memo, forwardRef } from 'react'
import Editor from '@monaco-editor/react'

const EditorPane = memo(forwardRef(({ value, onChange, language = 'java', theme = 'vs-dark', height = '100%' }, ref) => {
  return (
    <div className="editor" style={{ height: '100%' }}>
      <Editor
        height={height}
        language={language}
        theme={theme}
        value={value}
        onChange={(val) => onChange(val ?? '')}
        onMount={(editor) => { if (ref) ref.current = editor; }}
        options={{
          readOnly: false,
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