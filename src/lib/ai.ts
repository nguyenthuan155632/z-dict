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

1. **[Direct translation in ${targetLangName}]** - [Brief explanation or context if needed]
   - Example 1: [Example sentence in ${sourceLangName}]  
     → Translation: [Translation of Example 1 in ${targetLangName}]
   
   - Example 2: [Another example sentence in ${sourceLangName}]  
     → Translation: [Translation of Example 2 in ${targetLangName}]

2. **[Alternative translation in ${targetLangName}]** - [Brief explanation or context if needed]
   - Example 1: [Example sentence in ${sourceLangName}]  
     → Translation: [Translation of Example 1 in ${targetLangName}]
   
   - Example 2: [Another example sentence in ${sourceLangName}]  
     → Translation: [Translation of Example 2 in ${targetLangName}]

3. **[Another translation/meaning in ${targetLangName}]** - [Brief explanation or context if needed]
   - Example 1: [Example sentence in ${sourceLangName}]  
     → Translation: [Translation of Example 1 in ${targetLangName}]
   
   - Example 2: [Another example sentence in ${sourceLangName}]  
     → Translation: [Translation of Example 2 in ${targetLangName}]

🚨 CRITICAL FORMAT REQUIREMENTS 🚨

TRANSLATION DIRECTION: ${sourceLangName} → ${targetLangName}

EXACT FORMAT YOU MUST FOLLOW:

1. **[Translation/Word in ${targetLangName}]** - [Brief context/explanation]
   - Example 1: [Sentence in ${sourceLangName}]  
     → Translation: [Translation in ${targetLangName}]
   
   - Example 2: [Sentence in ${sourceLangName}]  
     → Translation: [Translation in ${targetLangName}]


2. **[Alternative Translation in ${targetLangName}]** - [Brief context/explanation]
   - Example 1: [Sentence in ${sourceLangName}]  
     → Translation: [Translation in ${targetLangName}]
   
   - Example 2: [Sentence in ${sourceLangName}]  
     → Translation: [Translation in ${targetLangName}]

🚨 CRITICAL TRANSLATION RULES:
- START with the direct, simple translation in BOLD (e.g., "**cầu lông**" for "badminton")
- DO NOT write long explanatory definitions as the main translation
- The bold text must be the actual translated word/phrase, NOT a definition
- After the bold translation, you can add " - " followed by a brief context if needed
- Example CORRECT format: "1. **cầu lông** - một môn thể thao dùng vợt"
- Example WRONG format: "1. **một môn thể thao trong nhà hoặc ngoài trời...**"
- THE ENTIRE LINE (both bold translation AND explanation after dash) MUST be in ${targetLangName}
- If translating English → Vietnamese: EVERYTHING must be in Vietnamese (e.g., "**trai hư** - một người đàn ông nổi loạn")
- If translating Vietnamese → English: EVERYTHING must be in English (e.g., "**badminton** - a racket sport played with shuttlecock")
- DO NOT mix languages in the definition line

OTHER REQUIREMENTS:
- Provide at least 2-3 different translations/meanings when applicable
- Each definition should have 2 examples with translations
- Include different contexts when the word has multiple uses
- The most common translation is listed first
- Phonetic transcription is accurate and in IPA format
- Examples must be natural and practical
- Keep explanations brief and clear
- Do NOT include a "Usage Notes" section`;
}

function createSentenceTranslationPrompt(request: TranslationRequest): string {
  const { text, sourceLanguage, targetLanguage } = request;
  const sourceLangName = sourceLanguage === "en" ? "English" : "Vietnamese";
  const targetLangName = targetLanguage === "en" ? "English" : "Vietnamese";

  return `You are a professional translator. Translate this ${sourceLangName} text to natural, idiomatic ${targetLangName}: "${text}"

CRITICAL TRANSLATION RULES:
- Provide ONLY the translated text - no explanations, no thinking process, no additional formatting
- The translation must sound NATURAL and NATIVE in ${targetLangName}
- PRESERVE the original formatting: new lines, line breaks, paragraph structure, spacing, etc.
- If the source has multiple lines or paragraphs, the translation MUST maintain the same structure
- Match the tone, register, and context of the original text (formal/informal, casual/professional)
- Use idiomatic expressions appropriate to the context, NOT literal word-for-word translation
- Consider cultural context and age-appropriate language

EXAMPLES OF NATURAL VS LITERAL TRANSLATION:
${sourceLanguage === 'vi' && targetLanguage === 'en' ? `
- Vietnamese: "hôm nay tôi muốn đi chơi"
  ❌ LITERAL (too childish): "Today I want to go out and play"
  ✅ NATURAL: "I want to go out today" or "I feel like going out today"
  
- Vietnamese: "ăn cơm chưa?"
  ❌ LITERAL: "Have you eaten rice yet?"
  ✅ NATURAL: "Have you eaten?" or "Did you eat?"

- Vietnamese multi-line:
  "Hôm nay tôi buồn
  
  tôi muốn đi chơi"
  ❌ WRONG (lost formatting): "I'm feeling sad today, I want to go out."
  ✅ CORRECT (preserves structure):
  "I'm feeling sad today
  
  I want to go out"
` : sourceLanguage === 'en' && targetLanguage === 'vi' ? `
- English: "How's it going?"
  ❌ LITERAL: "Nó đang đi như thế nào?"
  ✅ NATURAL: "Thế nào rồi?" or "Dạo này thế nào?"
  
- English: "I'm heading out"
  ❌ LITERAL: "Tôi đang hướng ra ngoài"
  ✅ NATURAL: "Tôi đi đây" or "Tôi ra ngoài đây"

- English multi-line:
  "I'm feeling tired
  
  I need a break"
  ❌ WRONG (lost formatting): "Tôi cảm thấy mệt, tôi cần nghỉ ngơi."
  ✅ CORRECT (preserves structure):
  "Tôi cảm thấy mệt
  
  Tôi cần nghỉ ngơi"
` : ''}

OUTPUT: Just the natural ${targetLangName} translation, nothing else.`;
}

export function isLikelyWord(text: string): boolean {
  // A simple heuristic: if text has no spaces and is not too long, it's likely a word
  // You can refine this logic based on your needs
  const trimmed = text.trim();
  const hasNoSpaces = !trimmed.includes(" ");
  const isReasonableLength = trimmed.length <= 30;

  return hasNoSpaces && isReasonableLength;
}
