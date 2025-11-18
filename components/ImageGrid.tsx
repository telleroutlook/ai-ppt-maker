import React from 'react';
import type { GeneratedImage } from '../types';

interface ImageGridProps {
    images: GeneratedImage[];
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, index) => {
                const imageKey = `${image.alt}-${image.src.slice(0, 24)}`;
                return (
                    <div key={imageKey} className="bg-white p-4 rounded-lg shadow-md border border-slate-200 transition-transform transform hover:scale-105 hover:shadow-xl">
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-auto object-cover rounded-md aspect-square"
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">{index === 0 ? 'Title Slide' : `Slide ${index}`}</p>
                    </div>
                );
            })}
        </div>
    );
};
