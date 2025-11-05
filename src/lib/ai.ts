import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export type Language = "en" | "vi";

export interface TranslationRequest {
  text: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  isWord: boolean;
}

export async function translateWithAI(
  request: TranslationRequest,
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = request.isWord
    ? createWordTranslationPrompt(request)
    : createSentenceTranslationPrompt(request);

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

function createWordTranslationPrompt(request: TranslationRequest): string {
  const { text, sourceLanguage, targetLanguage } = request;
  const sourceLangName = sourceLanguage === "en" ? "English" : "Vietnamese";
  const targetLangName = targetLanguage === "en" ? "English" : "Vietnamese";

  return `You are a professional bilingual dictionary. Provide a comprehensive dictionary entry for the word "${text}" from ${sourceLangName} to ${targetLangName}.

Format your response EXACTLY as follows:

**${text}**

**Phonetic:** [Provide IPA phonetic transcription, e.g., /ˈwɜːrd/]

**Part of Speech:** [noun/verb/adjective/adverb/etc.]

**Definitions:**

1. [Most common meaning/definition in ${targetLangName}]
   - Example 1: [Example sentence in ${sourceLangName}]  
     → Translation: [Translation of Example 1 in ${targetLangName}]
   
   - Example 2: [Another example sentence in ${sourceLangName}]  
     → Translation: [Translation of Example 2 in ${targetLangName}]

2. [Second meaning if applicable]
   - Example 1: [Example sentence in ${sourceLangName}]  
     → Translation: [Translation of Example 1 in ${targetLangName}]
   
   - Example 2: [Another example sentence in ${sourceLangName}]  
     → Translation: [Translation of Example 2 in ${targetLangName}]

3. [Third meaning if applicable]
   - Example 1: [Example sentence in ${sourceLangName}]  
     → Translation: [Translation of Example 1 in ${targetLangName}]
   
   - Example 2: [Another example sentence in ${sourceLangName}]  
     → Translation: [Translation of Example 2 in ${targetLangName}]

🚨 CRITICAL FORMAT REQUIREMENTS 🚨

TRANSLATION DIRECTION: ${sourceLangName} → ${targetLangName}

EXACT FORMAT YOU MUST FOLLOW:

1. [Definition 1 in ${targetLangName}]
   - Example 1: [Sentence in ${sourceLangName}]  
     → Translation: [Translation in ${targetLangName}]
   
   - Example 2: [Sentence in ${sourceLangName}]  
     → Translation: [Translation in ${targetLangName}]


2. [Definition 2 in ${targetLangName}]
   - Example 1: [Sentence in ${sourceLangName}]  
     → Translation: [Translation in ${targetLangName}]
   
   - Example 2: [Sentence in ${sourceLangName}]  
     → Translation: [Translation in ${targetLangName}]


3. [Definition 3 in ${targetLangName}]
   - Example 1: [Sentence in ${sourceLangName}]  
     → Translation: [Translation in ${targetLangName}]
   
   - Example 2: [Sentence in ${sourceLangName}]  
     → Translation: [Translation in ${targetLangName}]

OTHER REQUIREMENTS:
- ALWAYS provide at least 2-3 definitions, even for simple words
- Each definition MUST have EXACTLY 2 examples with translations (no exceptions)
- Include different contexts: literal meaning, common usage, idiomatic expressions
- The most commonly used meaning is listed first
- Phonetic transcription is accurate and in IPA format
- Examples must be natural, practical, and demonstrate proper usage in different contexts
- Make the entry detailed and comprehensive, similar to Oxford or Cambridge dictionaries
- Do NOT include a "Usage Notes" section`;
}

function createSentenceTranslationPrompt(request: TranslationRequest): string {
  const { text, sourceLanguage, targetLanguage } = request;
  const sourceLangName = sourceLanguage === "en" ? "English" : "Vietnamese";
  const targetLangName = targetLanguage === "en" ? "English" : "Vietnamese";

  return `Translate this ${sourceLangName} text to ${targetLangName}: "${text}"

IMPORTANT: Provide ONLY the translated text. No explanations, no thinking process, no additional formatting. Just the translation.`;
}

export function isLikelyWord(text: string): boolean {
  // A simple heuristic: if text has no spaces and is not too long, it's likely a word
  // You can refine this logic based on your needs
  const trimmed = text.trim();
  const hasNoSpaces = !trimmed.includes(" ");
  const isReasonableLength = trimmed.length <= 30;

  return hasNoSpaces && isReasonableLength;
}
