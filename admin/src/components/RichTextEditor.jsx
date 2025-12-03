import React from 'react'
import { Editor } from '@tinymce/tinymce-react'

const RichTextEditor = ({ value, onChange, height = 400, placeholder }) => {
    return (
        <Editor
            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
            value={value}
            onEditorChange={onChange}
            init={{
                height,
                menubar: false,
                placeholder,
                plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'codesample', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'codesample link image | removeformat | help',
                content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px }',
                codesample_languages: [
                    { text: 'Java', value: 'java' },
                    { text: 'JavaScript', value: 'javascript' },
                    { text: 'HTML/XML', value: 'markup' },
                    { text: 'CSS', value: 'css' },
                    { text: 'SQL', value: 'sql' }
                ]
            }}
        />
    )
}

export default RichTextEditor
