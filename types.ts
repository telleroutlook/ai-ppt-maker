
export interface GeneratedImage {
    src: string;
    alt: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

export interface PromptGenerationResult {
    prompts: string[];
    usedFallbackSubjects: boolean;
    fallbackReason?: string;
}
