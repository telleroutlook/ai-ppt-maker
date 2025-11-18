
# AI Presentation Generator

Generate infographic-style presentation slides in seconds. Provide a company or product name plus the audience you want to reach, and the app uses Google Gemini AI to create a title/hero slide plus five supporting slides. Each slide renders as a polished image you can download as a single PDF.

## Key Features

- **AI Slide Suggestions:** Gemini generates topic ideas tailored to your product and audience; curated fallbacks ensure coverage if the model is uncertain.
- **Imagen Slide Assets:** Each prompt produces an infographic-style image with minimalist layouts, professional icons, and a vibrant business palette.
- **Progressive UI:** Slide generation runs in parallel, shows a progress count, and caches recent decks for faster previews.
- **PDF Export:** Builds an A4 landscape deck with jsPDF, embeds a Chinese-friendly font, and gracefully skips missing slides.
- **Interactive Chatbot:** A Gemini-powered assistant helps you refine topics or troubleshoot presentation ideas without leaving the page.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 (or later) and `npm`.
- A Google Gemini API key stored in `API_KEY` (see configuration below).

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-ppt-maker.git
   cd ai-ppt-maker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the API key**
   - Create a `.env` file in the project root.
   - Add your Gemini key as `API_KEY=<your key>`.
   - Restart the dev server if it was running.

You can obtain a Gemini API key via [Google AI Studio](https://ai.google.dev/).

## Development & Publishing

- `npm run dev` — start Vite’s development server (hot reloads at http://localhost:5173).
- `npm run build` — bundle the production `dist/` output.
- `npm run preview` — serve the production build locally for a final check.

## Manual Testing Notes

Use the dev server to generate slides for a sample product, verify the preview updates per prompt, and ensure the PDF download includes all rendered slides. The chatbot panel remains open via the floating button if more guidance is needed.

## Stack Highlights

- **Frameworks:** Vite + React 19 + TypeScript + Tailwind CSS utilities.
- **AI Integrations:** `@google/genai` for Gemini text and Imagen image generation in `services/geminiService.ts`.
- **PDF Engine:** `jspdf` with embedded `NotoSansSC` to avoid font issues when downloading decks in `services/pdfService.ts`.
