import type { GeneratedImage } from '../types';

declare const jspdf: any;

export const generatePdf = (images: GeneratedImage[], productName: string) => {
    const { jsPDF } = jspdf;
    // Use landscape orientation for presentation slides
    const pdf = new jsPDF('l', 'mm', 'a4'); 
    const pdfWidth = 297; // A4 landscape width
    const pdfHeight = 210; // A4 landscape height
    const margin = 10;
    
    // Center the square image on the landscape page
    const imgSize = pdfHeight - margin * 2; // Fit to height
    const x = (pdfWidth - imgSize) / 2;
    const y = margin;

    images.forEach((image, index) => {
        if (index > 0) {
            pdf.addPage();
        }
        try {
          pdf.addImage(image.src, 'JPEG', x, y, imgSize, imgSize);
        } catch (error) {
          console.error("Error adding image to PDF:", error);
          // Add a placeholder page on error
          pdf.text("Could not load image.", pdfWidth / 2, pdfHeight / 2, { align: 'center' });
        }
    });

    pdf.save(`${productName.toLowerCase().replace(/\s/g, '-')}-presentation.pdf`);
};