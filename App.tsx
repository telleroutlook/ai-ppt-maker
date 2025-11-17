import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ImageGrid } from './components/ImageGrid';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Chatbot } from './components/Chatbot';
import { DownloadIcon, SparklesIcon, ChatBubbleIcon, CloseIcon } from './components/icons';
import { generatePresentationSlides } from './services/geminiService';
import { generatePdf } from './services/pdfService';
import type { GeneratedImage } from './types';

const App: React.FC = () => {
    const [productName, setProductName] = useState<string>('');
    const [audience, setAudience] = useState<string>('');
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

    const handleGenerate = useCallback(async (product: string, targetAudience: string) => {
        if (!product) {
            setError('Please provide a company or product name.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setProductName(product);
        setAudience(targetAudience);

        try {
            setLoadingMessage('Brainstorming presentation topics...');
            const pages = await generatePresentationSlides(product, targetAudience);
            
            const messages = [
                "Designing the title slide...",
                "Visualizing key features...",
                "Illustrating core benefits...",
                "Crafting the use case slide...",
                "Detailing the target market...",
                "Finalizing the summary slide..."
            ];

            const imagePromises = pages.map(async (page, index) => {
                setLoadingMessage(messages[index] || `Generating slide ${index + 1}...`);
                const response = await page.generationPromise;
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                return {
                    src: `data:image/png;base64,${base64ImageBytes}`,
                    alt: page.prompt
                };
            });

            const allImages = await Promise.all(imagePromises);

            setGeneratedImages(allImages);
        } catch (err) {
            console.error(err);
            setError('An error occurred while generating the slides. Please try again.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    const handleDownloadPdf = useCallback(() => {
        if (generatedImages.length === 0) return;
        generatePdf(generatedImages, productName);
    }, [generatedImages, productName]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Generate a Professional Slide Deck</h2>
                    <p className="text-slate-600 mb-8">Enter a product or company name, and let our AI create an introductory presentation for you.</p>
                </div>
                
                <InputForm onGenerate={handleGenerate} isLoading={isLoading} />

                {error && (
                    <div className="max-w-3xl mx-auto mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
                
                {isLoading && (
                    <div className="text-center my-12">
                        <LoadingSpinner />
                        <p className="text-lg text-sky-600 mt-4 animate-pulse">{loadingMessage}</p>
                    </div>
                )}

                {generatedImages.length > 0 && !isLoading && (
                    <div className="mt-12">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-slate-800">Your Presentation is Ready!</h3>
                            <button
                                onClick={handleDownloadPdf}
                                className="mt-4 inline-flex items-center gap-2 px-8 py-3 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105"
                            >
                                <DownloadIcon />
                                Download as PDF
                            </button>
                        </div>
                        <ImageGrid images={generatedImages} />
                    </div>
                )}

                {!isLoading && generatedImages.length === 0 && (
                    <div className="text-center text-slate-500 mt-16 p-8 bg-white rounded-xl shadow-sm max-w-2xl mx-auto border border-slate-200">
                        <SparklesIcon className="mx-auto h-16 w-16 text-sky-300" />
                        <p className="mt-4 text-lg">Your generated slides will appear here.</p>
                        <p className="text-sm">Try products like "Databricks", "Figma", or "Snowflake".</p>
                    </div>
                )}

            </main>
            
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="p-4 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform transform hover:scale-110"
                    aria-label={isChatOpen ? "Close Chat" : "Open Chat"}
                >
                    {isChatOpen ? <CloseIcon /> : <ChatBubbleIcon />}
                </button>
            </div>
            
            <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        </div>
    );
};

export default App;