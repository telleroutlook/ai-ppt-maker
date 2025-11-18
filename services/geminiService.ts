import { GoogleGenAI, Chat } from '@google/genai';
import type { PromptGenerationResult } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error('API_KEY environment variable not set');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
let chatInstance: Chat | null = null;

const imageGenerationConfig = {
    numberOfImages: 1,
    outputMimeType: 'image/jpeg',
    aspectRatio: '1:1' as const,
};

const PROMPT_STYLE =
    'professional business presentation slide, infographic style, clean vector art, vibrant corporate color palette (blues, teals, grays), professional icons, minimalist design, light-colored background, 16:9 aspect ratio, title positioned in the top-left corner, and space for short descriptive text.';

const FALLBACK_SUBJECTS = [
    'Positioning and promise',
    'Key differentiators',
    'Product journey',
    'Primary use cases',
    'Customer outcomes and metrics',
];

const cleanSubjectTags = (text: string) =>
    text
        .split(/[,\n]/)
        .map((value) => value.trim())
        .map((value) => value.replace(/^"|"$/g, ''))
        .filter(Boolean);

const describeCoverPrompt = (productName: string, audienceContext: string) =>
    `Title slide for a presentation about "${productName}". It should feature a clean, abstract logo representing technology and data, and the title "${productName}: An Overview". ${audienceContext} ${PROMPT_STYLE}`;

const describeSubjectPrompt = (subject: string, productName: string, audienceContext: string) =>
    `Presentation slide about "${subject}" for the product "${productName}". ${audienceContext} ${PROMPT_STYLE}`;

export const generatePresentationPrompts = async (
    productName: string,
    audience: string
): Promise<PromptGenerationResult> => {
    const audienceContext = audience ? `The target audience is ${audience}.` : '';
    const subjectPrompt = `List 5 key topics for an introductory presentation about "${productName}". The topics should be distinct and cover its purpose, key features, benefits, and primary use case. ${audienceContext} Just the list, comma separated.`;

    try {
        const subjectResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: subjectPrompt,
        });

        const subjects = cleanSubjectTags(subjectResponse.text || '')
            .slice(0, 5)
            .filter(Boolean);
        const sanitizedSubjects = [...new Set(subjects)];
        const usedFallbackSubjects = sanitizedSubjects.length === 0;
        const finalSubjects = usedFallbackSubjects ? FALLBACK_SUBJECTS : sanitizedSubjects;
        const fallbackReason = usedFallbackSubjects
            ? 'Could not infer unique topics from Gemini; falling back to curated presentation subjects.'
            : undefined;

        const coverPrompt = describeCoverPrompt(productName, audienceContext);
        const pagePrompts = finalSubjects.map((subject) =>
            describeSubjectPrompt(subject, productName, audienceContext)
        );

        return {
            prompts: [coverPrompt, ...pagePrompts],
            usedFallbackSubjects,
            fallbackReason,
        };
    } catch (error) {
        console.error('Subject generation failed, using fallback prompts.', error);
        const coverPrompt = describeCoverPrompt(productName, audienceContext);
        const pagePrompts = FALLBACK_SUBJECTS.map((subject) =>
            describeSubjectPrompt(subject, productName, audienceContext)
        );

        return {
            prompts: [coverPrompt, ...pagePrompts],
            usedFallbackSubjects: true,
            fallbackReason:
                'Subject generation failed; displaying curated fallback prompts that cover essential slide types.',
        };
    }
};

const extractImageBytes = (response: any) =>
    response.generatedImages?.[0]?.image?.imageBytes;

export const generateImageForPrompt = async (prompt: string) => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: imageGenerationConfig,
    });

    const imageBytes = extractImageBytes(response);

    if (!imageBytes) {
        throw new Error('Image generation returned an empty response.');
    }

    return `data:image/jpeg;base64,${imageBytes}`;
};

export const getChatbotResponse = async (message: string): Promise<string> => {
    if (!chatInstance) {
        chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction:
                    "You are a professional business analyst and presentation assistant. You provide concise, professional advice on creating effective presentation slides. Help users refine topics for their presentations about companies and products.",
            },
        });
    }

    try {
        const result = await chatInstance.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error('Chatbot error:', error);
        return 'I seem to be having trouble connecting. Please try again shortly.';
    }
};
