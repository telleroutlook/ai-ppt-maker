import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { DeckPreview } from './components/DeckPreview';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Chatbot } from './components/Chatbot';
import { SparklesIcon, ChatBubbleIcon, CloseIcon } from './components/icons';
import type { GeneratedImage } from './types';

const PROGRESS_MESSAGES = [
    'Designing the title and hero slide...',
    'Highlighting key differentiators...',
    'Visualizing standout product features...',
    'Illustrating the primary use case...',
    'Telling the customer success story...',
    'Wrapping up with a memorable summary...',
];

const SLIDE_CONCURRENCY = 2;

const App: React.FC = () => {
    const [productName, setProductName] = useState<string>('');
    const [audience, setAudience] = useState<string>('');
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
    const [downloadState, setDownloadState] = useState<'idle' | 'pending'>('idle');
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const isDownloading = downloadState === 'pending';
    const [slidesCompleted, setSlidesCompleted] = useState(0);
    const [progressTotal, setProgressTotal] = useState(0);
    const cacheRef = useRef(
        new Map<string, { images: GeneratedImage[]; fallbackNotice: string | null }>()
    );
    const reportGenerationError = useCallback(
        (err: unknown, fallback: string, overrideMessage?: string) => {
            const message =
                overrideMessage ??
                (err instanceof Error ? err.message : typeof err === 'string' ? err : fallback);
            console.error('Presentation generation error:', err);
            setError(message);
        },
        []
    );

    const handleGenerate = useCallback(async (product: string, targetAudience: string) => {
        const trimmedProduct = product.trim();
        const trimmedAudience = targetAudience.trim();

        if (!trimmedProduct) {
            setError('Please provide a company or product name.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setFallbackNotice(null);
        setDownloadState('idle');
        setDownloadError(null);
        setGeneratedImages([]);
        setProductName(trimmedProduct);
        setAudience(trimmedAudience);
        setSlidesCompleted(0);
        setProgressTotal(0);

        const cacheKey = `${trimmedProduct.toLowerCase()}|${trimmedAudience.toLowerCase()}`;
        const cachedResult = cacheRef.current.get(cacheKey);
        if (cachedResult) {
            setLoadingMessage('Reusing a recently generated deck for a faster preview...');
            setFallbackNotice(cachedResult.fallbackNotice);
            setGeneratedImages(cachedResult.images);
            setSlidesCompleted(cachedResult.images.length);
            setProgressTotal(cachedResult.images.length);
            setIsLoading(false);
            setLoadingMessage('');
            return;
        }

        try {
            setLoadingMessage('Planning your presentation structure...');
            const { generatePresentationPrompts, generateImageForPrompt } = await import('./services/geminiService');
            const { prompts, usedFallbackSubjects, fallbackReason } = await generatePresentationPrompts(
                trimmedProduct,
                trimmedAudience
            );

            const resolvedFallbackNotice = usedFallbackSubjects
                ? fallbackReason ?? 'Fallback slides were used to keep the deck moving.'
                : null;

            setFallbackNotice(resolvedFallbackNotice);

            const slideResults: Array<GeneratedImage | null> = Array(prompts.length).fill(null);
            const slideErrors: Error[] = [];
            let nextPromptIndex = 0;
            setSlidesCompleted(0);
            setProgressTotal(prompts.length);

            const worker = async () => {
                while (true) {
                    const promptIndex = nextPromptIndex;
                    nextPromptIndex += 1;
                    if (promptIndex >= prompts.length) {
                        break;
                    }

                    const prompt = prompts[promptIndex];
                    setLoadingMessage(PROGRESS_MESSAGES[promptIndex] ?? `Generating slide ${promptIndex + 1}...`);

                    try {
                        const imageSrc = await generateImageForPrompt(prompt);
                        slideResults[promptIndex] = { src: imageSrc, alt: prompt };
                    } catch (slideError) {
                        const slideErr =
                            slideError instanceof Error ? slideError : new Error('Slide generation failed.');
                        console.error('Slide generation error:', slideErr);
                        slideErrors.push(slideErr);
                    }
                    setSlidesCompleted((prev) => prev + 1);
                }
            };

            const workerCount = Math.min(prompts.length, SLIDE_CONCURRENCY);
            await Promise.all(Array.from({ length: workerCount }, () => worker()));

            const successfulImages = slideResults.filter(
                (image): image is GeneratedImage => Boolean(image)
            );

            if (successfulImages.length === 0) {
                throw new Error('No slides were generated.');
            }

            setGeneratedImages(successfulImages);
            if (slideErrors.length === 0) {
                cacheRef.current.set(cacheKey, {
                    images: successfulImages,
                    fallbackNotice: resolvedFallbackNotice,
                });
            }

            if (slideErrors.length > 0) {
                const slideErrorMessage = slideErrors[0]?.message ?? 'Slide generation failed for one or more prompts.';
                setError(`Some slides could not be generated (${slideErrorMessage}). Displayed slides are ready to download.`);
            }
        } catch (err) {
            if (err instanceof Error && err.message.includes('API_KEY')) {
                reportGenerationError(err, '', 'API key is missing. Please set API_KEY and restart the app.');
            } else {
                reportGenerationError(err, 'An unexpected error occurred while generating slides.');
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    const handleDownloadPdf = useCallback(async () => {
        if (generatedImages.length === 0) return;

        setDownloadState('pending');
        setDownloadError(null);

        try {
            const { generatePdf } = await import('./services/pdfService');
            await generatePdf(generatedImages, productName);
        } catch (downloadError) {
            console.error('PDF download failed:', downloadError);
            const friendlyMessage =
                downloadError instanceof Error
                    ? downloadError.message
                    : 'PDF download failed. Please try again.';
            setDownloadError(friendlyMessage);
        } finally {
            setDownloadState('idle');
        }
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
                    <div
                        className="max-w-3xl mx-auto mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
                        role="alert"
                        aria-live="assertive"
                    >
                        {error}
                    </div>
                )}
                
                {isLoading && (
                    <div className="text-center my-12">
                        <LoadingSpinner />
                        <p className="text-lg text-sky-600 mt-4 animate-pulse" role="status" aria-live="polite">
                            {loadingMessage}
                        </p>
                        {progressTotal > 0 && (
                            <p className="text-sm text-slate-500">{slidesCompleted}/{progressTotal} slides ready</p>
                        )}
                    </div>
                )}

                {generatedImages.length > 0 && !isLoading && (
                    <DeckPreview
                        images={generatedImages}
                        fallbackNotice={fallbackNotice}
                        productName={productName}
                        isDownloading={isDownloading}
                        downloadError={downloadError}
                        onDownload={handleDownloadPdf}
                    />
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
