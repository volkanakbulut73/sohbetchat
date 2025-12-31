
import { storageService } from "./storageService";
import { Participant, Message } from '../types';

/**
 * Groq API Configuration
 * Gemini tamamen kaldırıldı, Llama 3.3 (Groq) kullanılıyor.
 */
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Doğrudan Groq API çağrısı yapan fonksiyon
 */
async function callGroqApi(messages: any[], systemInstruction?: string): Promise<string> {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("Sistemde API anahtarı bulunamadı.");
        }

        const payload = {
            model: GROQ_MODEL,
            messages: [
                ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
                ...messages
            ],
            temperature: 0.8,
            max_tokens: 500
        };

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP hatası! Durum: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "...";
    } catch (error) {
        console.error("Groq API Hatası:", error);
        return "... (Bağlantı hatası: Groq servisi şu an yanıt vermiyor)";
    }
}

/**
 * App.tsx tarafından kullanılan ana bot yanıt fonksiyonu
 */
export const generateBotResponse = async (
    targetBot: Participant,
    allParticipants: Participant[],
    chatHistory: Message[],
    topic: string
): Promise<string> => {
    
    // 1. Bağlam Hazırlığı
    const participantDescriptions = allParticipants
        .map(p => `- ${p.name} (${p.isAi ? 'Bot' : 'İnsan'}): ${p.persona}`)
        .join('\n');

    const recentMessages = chatHistory.slice(-10);
    const conversationHistory = recentMessages.map(msg => {
        const sender = allParticipants.find(p => p.id === msg.senderId);
        const senderName = sender ? sender.name : 'Bilinmeyen';
        return {
            role: sender?.id === targetBot.id ? "assistant" : "user",
            content: `${senderName}: ${msg.text}`
        };
    });

    // 2. Sistem Talimatı Oluşturma
    const systemPrompt = `
Sen bir mIRC sohbet odasındasın.
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
`;

    const groqMessages = conversationHistory.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
    }));

    return await callGroqApi(groqMessages, systemPrompt);
};

/**
 * Eski yapı için uyumluluk nesnesi
 */
export const groqService = {
  async getChatResponse(prompt: string, sender: string): Promise<string> {
    try {
      const botPersonality = await storageService.getBotConfig();
      const systemInstruction = `${botPersonality}
      - Sohbet ettiğin nick: ${sender}.
      - Yanıtlar mIRC kültürüne uygun olsun.`;

      return await callGroqApi([{ role: "user", content: prompt }], systemInstruction);
    } catch (error) {
      return "Sistem: Bağlantı hatası (Groq Timeout).";
    }
  }
};
