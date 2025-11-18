import type { GeneratedImage } from '../types';
import { jsPDF } from 'jspdf';

const notoSansSCFontUrl = new URL('../assets/fonts/NotoSansSC-Regular.ttf', import.meta.url).href;
let notoSansSCBase64Promise: Promise<string> | null = null;

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const chunkSize = 0x8000;
    const bytes = new Uint8Array(buffer);
    let binary = '';

    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    return btoa(binary);
};

const fetchNotoSansSCBase64 = (): Promise<string> => {
    if (notoSansSCBase64Promise) {
        return notoSansSCBase64Promise;
    }

    notoSansSCBase64Promise = fetch(notoSansSCFontUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to load a Chinese font for the PDF export.');
            }

            return response.arrayBuffer();
        })
        .then(arrayBufferToBase64);

    return notoSansSCBase64Promise;
};

const ensureChineseFont = async (pdf: jsPDF): Promise<void> => {
    const fontBase64 = await fetchNotoSansSCBase64();
    pdf.addFileToVFS('NotoSansSC-Regular.ttf', fontBase64);
    pdf.addFont('NotoSansSC-Regular.ttf', 'NotoSansSC', 'normal');
    pdf.setFont('NotoSansSC');
};

const getImageFormat = (src: string) => (src.startsWith('data:image/png') ? 'PNG' : 'JPEG');
const buildFilename = (name: string) => {
    const safeName = (name || 'presentation')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-+|-+$)/g, '');

    return `${safeName || 'presentation'}-deck.pdf`;
};

export const generatePdf = async (images: GeneratedImage[], productName: string): Promise<void> => {
    if (images.length === 0) {
        throw new Error('PDF generation skipped because no slides are available.');
    }

    try {
        const pdf = new jsPDF('l', 'mm', 'a4');
        await ensureChineseFont(pdf);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const imgSize = Math.min(pageHeight - margin * 2, pageWidth - margin * 2);
        const x = (pageWidth - imgSize) / 2;
        const y = (pageHeight - imgSize) / 2;

        for (let index = 0; index < images.length; index += 1) {
            const image = images[index];

            if (index > 0) {
                pdf.addPage();
            }

            try {
                const format = getImageFormat(image.src);
                pdf.addImage(image.src, format, x, y, imgSize, imgSize);
            } catch (error) {
                console.error('Error adding image to PDF:', error);
                pdf.setFontSize(12);
                pdf.text('Could not render this slide.', pageWidth / 2, pageHeight / 2, { align: 'center' });
            }
        }

        pdf.save(buildFilename(productName));
    } catch (error) {
        console.error('PDF generation failed:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('PDF generation failed.');
    }
};
