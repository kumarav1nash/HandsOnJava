import React, { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

const MCQPreview = ({ mcq }) => {
    const [answers, setAnswers] = useState({})
    const [checked, setChecked] = useState(false)

    if (!mcq) return null

    const toggle = (qi, optId) => {
        if (checked) return
        setAnswers(prev => ({ ...prev, [qi]: optId }))
    }

    const onCheck = () => setChecked(true)
    const onReset = () => { setAnswers({}); setChecked(false) }

    const score = () => {
        let correct = 0
        mcq.questions.forEach((q, i) => {
            const chosen = answers[i]
            const opt = q.options.find(o => o.id === chosen)
            if (opt && opt.correct) correct++
        })
        return { correct, total: mcq.questions.length }
    }

    const { correct, total } = score()

    return (
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-8 border-b pb-6">
                <h2 className="text-2xl font-bold text-gray-900">{mcq.title}</h2>
                <div className="space-x-2">
                    <button
                        onClick={onCheck}
                        disabled={checked || Object.keys(answers).length < mcq.questions.length}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 hover:bg-blue-700"
                    >
                        Check Answers
                    </button>
                    <button
                        onClick={onReset}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        Reset
                    </button>
                </div>
            </header>

            <div className="space-y-8">
                {mcq.questions.map((q, qi) => {
                    const chosen = answers[qi]
                    const isCorrect = checked && q.options.find(o => o.id === chosen)?.correct

                    return (
                        <div key={qi} className={`p-6 rounded-lg border ${checked ? (isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50') : 'border-gray-200 bg-gray-50'}`}>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">{qi + 1}. {q.prompt}</h3>
                            <div className="space-y-3">
                                {q.options.map(opt => {
                                    const isSelected = chosen === opt.id
                                    const showCorrect = checked && opt.correct
                                    const showWrong = checked && isSelected && !opt.correct

                                    return (
                                        <label key={opt.id} className={`flex items-center p-3 rounded border cursor-pointer transition-colors ${isSelected
                                                ? 'bg-blue-50 border-blue-500'
                                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}>
                                            <input
                                                type="radio"
                                                name={`q_${qi}`}
                                                checked={isSelected}
                                                onChange={() => toggle(qi, opt.id)}
                                                disabled={checked}
                                                className="mr-3 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="flex-1 text-gray-700">{opt.text}</span>
                                            {showCorrect && <span className="flex items-center text-green-600 font-medium ml-2"><CheckCircle size={16} className="mr-1" /> Correct</span>}
                                            {showWrong && <span className="flex items-center text-red-600 font-medium ml-2"><XCircle size={16} className="mr-1" /> Your Answer</span>}
                                        </label>
                                    )
                                })}
                            </div>
                            {checked && (
                                <div className="mt-4 p-4 bg-white/50 rounded text-sm text-gray-600">
                                    <strong>Explanation:</strong> {q.explanation}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {checked && (
                <div className="mt-8 text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold mb-2">
                        Score: <span className={correct === total ? 'text-green-600' : 'text-gray-900'}>{correct}/{total}</span>
                    </div>
                    {correct === total ? (
                        <p className="text-green-600">Perfect score!</p>
                    ) : (
                        <p className="text-gray-500">Review the explanations and try again.</p>
                    )}
                </div>
            )}
        </div>
    )
}

export default MCQPreview
