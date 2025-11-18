import React, { useState } from 'react';
import { SparklesIcon } from './icons';

interface InputFormProps {
    onGenerate: (product: string, audience: string) => void;
    isLoading: boolean;
}

const EXAMPLE_INPUTS = [
    { label: 'Databricks ⋅ Data platform leads', product: 'Databricks', audience: 'Data platform leads' },
    { label: 'Figma ⋅ Product design teams', product: 'Figma', audience: 'Product design teams' },
    { label: 'Snowflake ⋅ Chief data officers', product: 'Snowflake', audience: 'Chief data officers' },
];

export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
    const [product, setProduct] = useState('');
    const [audience, setAudience] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedProduct = product.trim();
        const trimmedAudience = audience.trim();

        if (!trimmedProduct) return;
        onGenerate(trimmedProduct, trimmedAudience);
    };

    const isSubmitDisabled = isLoading || product.trim().length === 0;

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-200 space-y-4">
            <div className="space-y-2">
                <label htmlFor="product" className="block text-sm font-medium text-gray-700">Company/Product Name</label>
                <input
                    id="product"
                    type="text"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="e.g., Databricks"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 bg-white text-gray-900 placeholder-gray-400"
                    required
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="audience" className="block text-sm font-medium text-gray-700">Target Audience (Optional)</label>
                <input
                    id="audience"
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g., Technical executives"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 bg-white text-gray-900 placeholder-gray-400"
                />
            </div>
            <div className="space-y-1 text-sm text-slate-500">
                <p>Try a ready-made pairing that fits your use case:</p>
                <div className="flex flex-wrap gap-2">
                    {EXAMPLE_INPUTS.map((example) => (
                        <button
                            key={example.label}
                            type="button"
                            onClick={() => {
                                setProduct(example.product);
                                setAudience(example.audience);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-slate-600 hover:bg-slate-100 transition"
                        >
                            <SparklesIcon className="h-4 w-4 text-slate-400" />
                            <span>{example.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            <button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Slides...
                    </>
                ) : (
                    <>
                        <SparklesIcon />
                        Generate Presentation
                    </>
                )}
            </button>
        </form>
    );
};
