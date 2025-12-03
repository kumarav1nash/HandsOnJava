import React from 'react'
import DOMPurify from 'dompurify'
import InlineCodeRunner from './InlineCodeRunner'

const ConceptPreview = ({ concept }) => {
    if (!concept) return null

    const html = DOMPurify.sanitize(concept.overview || '')

    return (
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-4xl mx-auto">
            <header className="mb-8 border-b pb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{concept.title}</h1>
                <p className="text-xl text-gray-600">{concept.summary}</p>
            </header>

            <section className="space-y-8">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
                    <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: html }} />
                </div>

                {concept.starterCode && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Example</h3>
                        <InlineCodeRunner initialCode={concept.starterCode} />
                    </div>
                )}

                {concept.steps && concept.steps.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900">Steps</h2>
                        {concept.steps.map((step, i) => (
                            <div key={step.id || i} className="bg-gray-50 rounded-lg p-6 border">
                                <h3 className="flex items-start gap-3 text-lg font-medium text-gray-900 mb-4">
                                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-sm">
                                        {i + 1}
                                    </span>
                                    {step.description}
                                </h3>

                                {step.hint && (
                                    <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm border border-yellow-100">
                                        <strong>Hint:</strong> {step.hint}
                                    </div>
                                )}

                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 mb-2">Try it out:</p>
                                    <InlineCodeRunner initialCode={concept.starterCode} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default ConceptPreview
