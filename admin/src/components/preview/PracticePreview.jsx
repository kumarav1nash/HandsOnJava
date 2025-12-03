import React, { useState, useCallback } from 'react'
import SplitPane from './SplitPane'
import EditorPane from './EditorPane'
import OutputPane from './OutputPane'
import { runJavaDirect } from '../../services/compiler'
import { Play, RotateCcw } from 'lucide-react'

const PracticePreview = ({ practice }) => {
    const [code, setCode] = useState(practice?.starterCode || '')
    const [stdin, setStdin] = useState(practice?.stdin || '')
    const [running, setRunning] = useState(false)
    const [stdout, setStdout] = useState('')
    const [stderr, setStderr] = useState('')
    const [meta, setMeta] = useState(null)
    const [activeTab, setActiveTab] = useState('input')

    if (!practice) return null

    const onRun = useCallback(async () => {
        if (!code.trim()) return
        setRunning(true); setStdout(''); setStderr(''); setMeta(null); setActiveTab('output')
        const start = Date.now()
        try {
            const res = await runJavaDirect(code, stdin)
            setStdout(res.stdout); setStderr(res.stderr)
            setMeta({ exitCode: res.exitCode, executionTime: res.durationMs || Date.now() - start })
        } catch (e) {
            setStderr(e?.message || 'Error'); setMeta({ exitCode: -1, executionTime: Date.now() - start })
        } finally { setRunning(false) }
    }, [code, stdin])

    const onReset = () => {
        setCode(practice?.starterCode || '')
        setStdout('')
        setStderr('')
        setMeta(null)
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden h-[800px] flex flex-col max-w-6xl mx-auto">
            <header className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{practice.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{practice.goal}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <RotateCcw size={14} />
                        Reset Code
                    </button>
                    <button
                        onClick={onRun}
                        disabled={running}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                        <Play size={14} />
                        {running ? 'Running...' : 'Run Code'}
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                <SplitPane direction="horizontal" sizes={[40, 60]} minSize={300}>
                    {/* Left Pane: Instructions & Hint */}
                    <div className="h-full overflow-y-auto p-6 bg-gray-50">
                        <div className="prose prose-sm max-w-none">
                            <h3 className="text-gray-900">Instructions</h3>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                <li>Read the goal carefully.</li>
                                <li>Write your code in the editor on the right.</li>
                                <li>Use the "Run Code" button to test your code.</li>
                            </ul>
                        </div>

                        {practice.hint && (
                            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-md">
                                <h4 className="text-sm font-bold text-blue-900 mb-1">Hint</h4>
                                <p className="text-sm text-blue-800">{practice.hint}</p>
                            </div>
                        )}

                        {practice.expectedStdout && (
                            <div className="mt-6">
                                <h4 className="text-sm font-bold text-gray-700 mb-2">Expected Output</h4>
                                <pre className="bg-gray-800 text-gray-300 p-3 rounded-md text-xs font-mono overflow-x-auto">
                                    {practice.expectedStdout}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Right Pane: Editor & IO */}
                    <div className="h-full flex flex-col bg-gray-900">
                        <SplitPane direction="vertical" sizes={[70, 30]} minSize={100}>
                            <div className="h-full">
                                <EditorPane
                                    value={code}
                                    onChange={setCode}
                                    language="java"
                                    theme="vs-dark"
                                    onRun={onRun}
                                />
                            </div>

                            <div className="h-full flex flex-col bg-gray-900 border-t border-gray-700">
                                <div className="flex border-b border-gray-700 bg-gray-800">
                                    <button
                                        onClick={() => setActiveTab('input')}
                                        className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === 'input'
                                                ? 'border-blue-500 text-white bg-gray-900'
                                                : 'border-transparent text-gray-400 hover:text-gray-300'
                                            }`}
                                    >
                                        Input
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('output')}
                                        className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === 'output'
                                                ? 'border-blue-500 text-white bg-gray-900'
                                                : 'border-transparent text-gray-400 hover:text-gray-300'
                                            }`}
                                    >
                                        Output {meta && (meta.exitCode === 0 ? '✓' : '✗')}
                                    </button>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    {activeTab === 'input' ? (
                                        <div className="h-full p-4 flex flex-col">
                                            <label className="text-xs text-gray-400 mb-2 block">Program Input (stdin)</label>
                                            <textarea
                                                value={stdin}
                                                onChange={(e) => setStdin(e.target.value)}
                                                className="flex-1 w-full bg-gray-800 text-gray-300 p-3 rounded border border-gray-700 font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
                                                placeholder="Enter input for your program..."
                                            />
                                        </div>
                                    ) : (
                                        <OutputPane
                                            stdout={stdout}
                                            stderr={stderr}
                                            metadata={meta}
                                            isRunning={running}
                                            onClear={() => { setStdout(''); setStderr(''); setMeta(null) }}
                                        />
                                    )}
                                </div>
                            </div>
                        </SplitPane>
                    </div>
                </SplitPane>
            </div>
        </div>
    )
}

export default PracticePreview
