import { memo } from 'react'
import Editor from '@monaco-editor/react'

const EditorPane = memo(({ value, onChange, language = 'java' }) => {
  return (
    <div className="editor">
      <Editor
        height="400px"
        defaultLanguage={language}
        value={value}
        onChange={(val) => onChange(val ?? '')}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  )
})

export default EditorPane