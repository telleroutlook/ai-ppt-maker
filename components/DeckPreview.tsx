import React from 'react';
import { DownloadIcon, SparklesIcon } from './icons';
import { ImageGrid } from './ImageGrid';
import type { GeneratedImage } from '../types';

interface DeckPreviewProps {
    images: GeneratedImage[];
    fallbackNotice: string | null;
    productName: string;
    isDownloading: boolean;
    downloadError: string | null;
    onDownload: () => Promise<void>;
}

export const DeckPreview: React.FC<DeckPreviewProps> = ({
    images,
    fallbackNotice,
    productName,
    isDownloading,
    downloadError,
    onDownload,
}) => {
    return (
        <div className="mt-12">
            <div className="text-center mb-8 space-y-4">
                <div className="flex flex-col items-center gap-3">
                    <h3 className="text-2xl font-bold text-slate-800">Your Presentation is Ready!</h3>
                    {fallbackNotice && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm text-sky-700 bg-sky-50 border border-sky-200 rounded-full">
                            <SparklesIcon className="h-4 w-4 text-sky-500" />
                            <span>{fallbackNotice}</span>
                        </div>
                    )}
                    <button
                        onClick={onDownload}
                        className="mt-2 inline-flex items-center gap-2 px-8 py-3 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={isDownloading}
                    >
                        <DownloadIcon />
                        {isDownloading ? 'Preparing download...' : 'Download as PDF'}
                    </button>
                    <p className="text-sm text-slate-600" aria-live="polite">
                        {isDownloading
                            ? 'Creating a polished PDF version of your deck...'
                            : `${productName ? `Slides for ${productName} are ready to export.` : 'Download when you are ready.'}`}
                    </p>
                    {downloadError && (
                        <div
                            className="max-w-xs text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg"
                            role="alert"
                        >
                            {downloadError}
                        </div>
                    )}
                </div>
            </div>
            <ImageGrid images={images} />
        </div>
    );
};
