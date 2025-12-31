
import { GoogleGenAI } from "@google/genai";
import { storageService } from "./storageService";
import { Participant, Message } from '../types';

/**
 * Gemini API Configuration
 * Re-implementing AI logic with Google Gemini 3 Pro as per developer expertise and project guidelines.
 */
const GEMINI_MODEL = "gemini-3-pro-preview";

/**
 * Main bot response function using Gemini API
 */
export const generateBotResponse = async (
    targetBot: Participant,
    allParticipants: Participant[],
    chatHistory: Message[],
    topic: string
): Promise<string> => {
    // Initializing Gemini client with process.env.API_KEY as strictly required
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // 1. Context Preparation
    const participantDescriptions = allParticipants
        .map(p => `- ${p.name} (${p.isAi ? 'Bot' : 'İnsan'}): ${p.persona}`)
        .join('\n');

    // Gemini multi-turn format uses 'user' and 'model' roles
    const recentMessages = chatHistory.slice(-15);
    const conversationHistory = recentMessages.map(msg => {
        const sender = allParticipants.find(p => p.id === msg.senderId);
        const senderName = sender ? sender.name : 'Bilinmeyen';
        return {
            role: sender?.id === targetBot.id ? "model" : "user",
            parts: [{ text: `${senderName}: ${msg.text}` }]
        };
    });

    // 2. System Instruction Construction
    const systemInstruction = `
Sen bir mIRC sohbet odasındasın (Workigom Secure Network).
Konu: ${topic}

Odadaki Katılımcılar:
${participantDescriptions}

Senin Karakterin:
Adın: ${targetBot.name}
Kişiliğin: ${targetBot.persona}

KURALLAR:
1. SADECE ${targetBot.name} olarak konuş.
2. Mesajın başına adını veya "Assistant:" yazma.
3. mIRC jargonunu kullan (kısa, samimi, bazen emojili).
4. Diğer kullanıcıların yazdıklarına göre doğal tepkiler ver.
5. Türkçe karakter kullan ama internet diline sadık kal.
6. Gerçek bir mIRC kullanıcısı gibi davran; bilgece, iğneleyici veya neşeli olabilirsin.
`;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: conversationHistory,
            config: {
                systemInstruction,
                temperature: 0.8,
                topP: 0.95,
                topK: 40
            }
        });

        // Directly accessing .text property as per GenerateContentResponse guidelines
        return response.text || "...";
    } catch (error) {
        console.error("Gemini API Execution Error:", error);
        return "... (Bağlantı hatası: Gemini servisi şu an yanıt vermiyor)";
    }
};

/**
 * Compatibility object maintained for existing imports
 */
export const groqService = {
  async getChatResponse(prompt: string, sender: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const botPersonality = await storageService.getBotConfig();
      const systemInstruction = `${botPersonality}
      - Sohbet ettiğin nick: ${sender}.
      - Yanıtlar mIRC kültürüne uygun olsun.`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { systemInstruction }
      });

      return response.text || "Sistem: Bağlantı hatası (Gemini Timeout).";
    } catch (error) {
      console.error("Gemini Compatibility Error:", error);
      return "Sistem: Bağlantı hatası (Gemini Timeout).";
    }
  }
};
