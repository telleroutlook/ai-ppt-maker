import type { GeneratedImage } from '../types';
import { jsPDF } from 'jspdf';

const getImageFormat = (src: string) => (src.startsWith('data:image/png') ? 'PNG' : 'JPEG');
const buildFilename = (name: string) => {
    const safeName = (name || 'presentation')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-+|-+$)/g, '');

    return `${safeName || 'presentation'}-deck.pdf`;
};

export const generatePdf = (images: GeneratedImage[], productName: string) => {
    if (images.length === 0) {
        console.warn('PDF generation skipped because no slides are available.');
        return;
    }

    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const imgSize = Math.min(pageHeight - margin * 2, pageWidth - margin * 2);
    const x = (pageWidth - imgSize) / 2;
    const y = (pageHeight - imgSize) / 2;

    images.forEach((image, index) => {
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
    });

    pdf.save(buildFilename(productName));
};
