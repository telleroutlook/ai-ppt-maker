# Repository Guidelines

## Project Structure & Module Organization
`index.tsx` boots the Vite/React stack, renders `App`, and pulls `index.html` as the shell. `App.tsx` orchestrates the UI, the Gemini-powered `generatePresentationSlides` flow, and PDF export. UI pieces live under `components/` (PascalCase filenames for React components, e.g., `InputForm.tsx` or `Chatbot.tsx`), while API wrappers live under `services/` (`geminiService.ts`, `pdfService.ts`). Shared shapes live in `types.ts`, and project metadata is summarized in `metadata.json`. Assets beyond React markup (icons, styles) are embedded via inline SVG or Tailwind classes, so treat `components/` as the landing zone for new views.

## Build, Test, and Development Commands
- `npm run dev`: Launches Vite’s dev server with HMR so you can iterate on UI and service integration locally (query `http://localhost:5173`).
- `npm run build`: Produces a production-ready `dist/` folder that mirrors what `preview` serves; run this before publishing to confirm Gemini/PDF flows bundle.
- `npm run preview`: Serves the `dist/` output so you can validate the production build before deployment.

## Coding Style & Naming Conventions
This is a TypeScript + React (Vite) app with 4-space indentation. Prefer PascalCase for component names/folders and camelCase for hooks, helper functions, and prop names (e.g., `handleGenerate`, `generatePdf`). Strings typically use single quotes unless interpolation or HTML attributes demand double quotes. Keep Tailwind utility classes grouped by layout > spacing > color to mirror existing files, and keep business logic in `services/` so UI components remain presentational.

## Testing Guidelines
No automated tests are defined yet. Test new UI/service combinations manually by running `npm run dev`, exercising the form, and checking the PDF download. If you add test tooling (Vitest, React Testing Library), place specs beside their components (e.g., `components/InputForm.test.tsx`) and document the new command here.

## Commit & Pull Request Guidelines
History currently has a single `Initial commit`, so future work should follow an imperative, short form (`feat: add PDF loading`, `fix: handle missing API key`). Each PR should explain what changed, describe any manual testing steps, and note any trimmed environment setup (e.g., new Gemini scopes). Include screenshots if UI messaging changed, and link related issues or tickets in the description.

## Security & Configuration Tips
The Gemini integrations rely on `process.env.API_KEY`. Never commit secrets—create a `.env` with `API_KEY=your-key`, keep it out of Git, and restart the dev server after editing it. If you update prompts or image models, double-check `services/geminiService.ts` so the instructions stay professional and aligned with the brand voice.
