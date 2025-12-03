import React, { useRef, useEffect } from 'react'
import { Clock, AlertCircle, CheckCircle, Terminal, Trash2, Info } from 'lucide-react'

const OutputPane = ({
    stdout,
    stderr,
    metadata,
    isRunning,
    onClear
}) => {
    const outputRef = useRef(null)
    const hasStdout = stdout && stdout.trim()
    const hasStderr = stderr && stderr.trim()
    const hasAnyOutput = hasStdout || hasStderr

    // Auto-scroll to bottom when new output arrives
    useEffect(() => {
        if (outputRef.current && hasAnyOutput) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight
        }
    }, [stdout, stderr, hasAnyOutput])

    const formatExecutionTime = (time) => {
        if (!time) return ''
        return time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(2)}s`
    }

    return (
        <div className="flex flex-col h-full bg-gray-900 text-gray-300 rounded-md overflow-hidden border border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        {isRunning ? (
                            <span className="animate-spin">⏳</span>
                        ) : hasStderr ? (
                            <AlertCircle size={16} className="text-red-400" />
                        ) : hasStdout ? (
                            <CheckCircle size={16} className="text-green-400" />
                        ) : (
                            <Terminal size={16} className="text-gray-400" />
                        )}
                        <span className="text-sm font-medium">
                            {isRunning ? 'Running...' : hasStderr ? 'Error' : hasStdout ? 'Success' : 'Ready'}
                        </span>
                    </div>
                    {metadata?.executionTime && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded">
                            <Clock size={12} />
                            {formatExecutionTime(metadata.executionTime)}
                        </div>
                    )}
                </div>

                {hasAnyOutput && (
                    <button
                        onClick={onClear}
                        className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                        title="Clear output"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {/* Content */}
            <div
                ref={outputRef}
                className="flex-1 overflow-auto p-4 font-mono text-sm"
            >
                {isRunning ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Executing Java program...</span>
                    </div>
                ) : hasAnyOutput ? (
                    <div className="space-y-4">
                        {hasStdout && (
                            <div>
                                <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Standard Output</div>
                                <pre className="text-gray-200 whitespace-pre-wrap break-words">{stdout}</pre>
                            </div>
                        )}

                        {hasStderr && (
                            <div>
                                <div className="text-xs font-semibold text-red-400 mb-1 uppercase tracking-wider">Error Output</div>
                                <pre className="text-red-300 whitespace-pre-wrap break-words bg-red-900/20 p-2 rounded border border-red-900/30">{stderr}</pre>
                            </div>
                        )}

                        {metadata && (
                            <div className="pt-4 mt-4 border-t border-gray-800">
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    <Info size={12} />
                                    <span className="uppercase tracking-wider">Execution Details</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {metadata.executionTime && (
                                        <div className="flex justify-between bg-gray-800/50 p-2 rounded">
                                            <span className="text-gray-500">Time:</span>
                                            <span className="font-mono text-gray-300">{formatExecutionTime(metadata.executionTime)}</span>
                                        </div>
                                    )}
                                    {metadata.exitCode !== undefined && (
                                        <div className="flex justify-between bg-gray-800/50 p-2 rounded">
                                            <span className="text-gray-500">Exit Code:</span>
                                            <span className={`font-mono ${metadata.exitCode === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {metadata.exitCode}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
                        <Terminal size={32} className="opacity-20" />
                        <p>No output yet</p>
                        <p className="text-xs opacity-60">Run your code to see results</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default OutputPane
