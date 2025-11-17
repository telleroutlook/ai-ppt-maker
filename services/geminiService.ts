import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
let chatInstance: Chat | null = null;

const imageGenerationConfig = {
    numberOfImages: 1,
    outputMimeType: 'image/jpeg',
    aspectRatio: '1:1' as const,
};

const PROMPT_STYLE = "professional business presentation slide, infographic style, clean vector art, vibrant corporate color palette (blues, teals, grays), professional icons, minimalist design, on a clean white background. Contains space for a title and short descriptive text.";

export const generatePresentationSlides = async (productName: string, audience: string) => {
    const audienceContext = audience ? `The target audience is ${audience}.` : '';

    const subjectPrompt = `List 5 key topics for an introductory presentation about "${productName}". The topics should be distinct and cover its purpose, key features, benefits, and primary use case. ${audienceContext} Just the list, comma separated.`;
    
    const subjectResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: subjectPrompt,
    });

    const subjects = subjectResponse.text.split(',').map(s => s.trim()).slice(0, 5);

    const coverPrompt = `Title slide for a presentation about "${productName}". It should feature a clean, abstract logo representing technology and data, and the title "${productName}: An Overview". ${PROMPT_STYLE}`;
    
    const pagePrompts = subjects.map(subject => 
        `Presentation slide about "${subject}" for the product "${productName}". ${audienceContext} ${PROMPT_STYLE}`
    );

    const allPrompts = [coverPrompt, ...pagePrompts];

    return allPrompts.map(prompt => ({
        prompt,
        generationPromise: ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt,
            config: imageGenerationConfig,
        }),
    }));
};

export const getChatbotResponse = async (message: string): Promise<string> => {
    if (!chatInstance) {
        chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are a professional business analyst and presentation assistant. You provide concise, professional advice on creating effective presentation slides. Help users refine topics for their presentations about companies and products."
            }
        });
    }

    try {
        const result = await chatInstance.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Chatbot error:", error);
        return "I seem to be having trouble connecting. Please try again shortly.";
    }
};