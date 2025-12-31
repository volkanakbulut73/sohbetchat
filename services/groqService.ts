
import { storageService } from "./storageService";
import { Participant, Message } from '../types';
import { GoogleGenAI } from "@google/genai";

/**
 * AI Configuration using Google GenAI SDK
 */
const MODEL = "gemini-3-pro-preview";

/**
 * Shared function to call Gemini API
 */
async function callGeminiApi(contents: string, systemInstruction?: string): Promise<string> {
    try {
        // Create a new instance right before use to ensure up-to-date API key
        // Following guidelines: always use { apiKey: process.env.API_KEY }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: MODEL,
            // Following guidelines: passing the text contents directly as a string
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
            },
        });

        // Following guidelines: using the .text property (getter) to access output
        return response.text || "...";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "... (Bağlantı hatası)";
    }
}

/**
 * Function used by the main App.tsx (Modern UI)
 */
export const generateBotResponse = async (
    targetBot: Participant,
    allParticipants: Participant[],
    chatHistory: Message[],
    topic: string
): Promise<string> => {
    
    // 1. Prepare Context
    const participantDescriptions = allParticipants
        .map(p => `- ${p.name} (${p.isAi ? 'Yapay Zeka' : 'İnsan'}): ${p.persona}`)
        .join('\n');

    const recentMessages = chatHistory.slice(-15); // Context of last 15 messages
    const conversationLog = recentMessages.map(msg => {
        const sender = allParticipants.find(p => p.id === msg.senderId);
        const senderName = sender ? sender.name : 'Bilinmeyen';
        return `${senderName}: ${msg.text}`;
    }).join('\n');

    // 2. Construct System Instruction
    const systemPrompt = `
Bu bir grup sohbeti simülasyonudur.
Konu: ${topic}

Katılımcılar:
${participantDescriptions}

Senin Rolün:
Adın: ${targetBot.name}
Kişiliğin: ${targetBot.persona}

Kurallar:
1. Sadece ${targetBot.name} olarak cevap ver.
2. Adını mesajın başına yazma.
3. Rolüne sadık kal, kısa, samimi ve doğal bir mIRC kullanıcısı gibi konuş.
4. Diğer katılımcıların mesajlarına atıfta bulunabilirsin.
5. Türkçe karakterleri düzgün kullan ama internet jargonuna (mIRC) hakim ol.
`;

    // 3. Construct current turn
    const userPrompt = `Sohbet Geçmişi:\n${conversationLog}\n\n(Sıra sende, ${targetBot.name} olarak cevap ver)`;

    return await callGeminiApi(userPrompt, systemPrompt);
};

/**
 * Legacy Service Object (used by useChatCore.ts / mIRC mode)
 */
export const groqService = {
  async getChatResponse(prompt: string, sender: string): Promise<string> {
    try {
      // Dinamik bot eğitimi/kişiliği veritabanından çekiliyor
      const botPersonality = await storageService.getBotConfig();

      const systemInstruction = `${botPersonality}
      - Sohbet ettiğin kişinin nicki: ${sender}.
      - Cevapların kısa, öz ve Türkçe olsun.
      - mIRC jargonunu asla bırakma.`;

      return await callGeminiApi(prompt, systemInstruction);
    } catch (error) {
      return "Sistem: Bağlantı hatası oluştu (Ping timeout).";
    }
  }
};
