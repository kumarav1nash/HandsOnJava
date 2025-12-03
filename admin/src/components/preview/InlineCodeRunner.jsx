import React, { useState } from 'react'
import { runJavaDirect } from '../../services/compiler'
import { Play, RotateCcw } from 'lucide-react'

const InlineCodeRunner = ({ initialCode }) => {
    const [code, setCode] = useState(initialCode || '')
    const [output, setOutput] = useState('')
    const [isRunning, setIsRunning] = useState(false)

    const handleRun = async () => {
        setIsRunning(true)
        setOutput('Running...')
        try {
            const res = await runJavaDirect(code)
            setOutput(res.stdout || res.stderr || 'No output')
        } catch (err) {
            setOutput('Error: ' + err.message)
        } finally {
            setIsRunning(false)
        }
    }

    const handleReset = () => {
        setCode(initialCode || '')
        setOutput('')
    }

    return (
        <div className="border rounded-lg overflow-hidden bg-gray-900 text-white my-4">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-sm font-mono text-gray-400">Java Runner</span>
                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                        title="Reset Code"
                    >
                        <RotateCcw size={14} />
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-medium transition-colors disabled:opacity-50"
                    >
                        <Play size={12} />
                        {isRunning ? 'Running...' : 'Run'}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 h-64">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full p-4 bg-gray-900 text-gray-300 font-mono text-sm resize-none focus:outline-none border-r border-gray-800"
                    spellCheck="false"
                />
                <div className="w-full h-full p-4 bg-black text-gray-300 font-mono text-sm overflow-auto whitespace-pre-wrap">
                    {output || <span className="text-gray-600 italic">Output will appear here...</span>}
                </div>
            </div>
        </div>
    )
}

export default InlineCodeRunner
