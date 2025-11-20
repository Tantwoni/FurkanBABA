import { GoogleGenAI } from "@google/genai";
import { Invoice, Contact } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const askFinancialAssistant = async (
  question: string,
  contextData: { invoices: Invoice[], contacts: Contact[] }
): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash';
    
    // Prepare context summary to avoid token limits if list is huge, 
    // but for this demo we send the JSON string of recent data.
    const dataContext = JSON.stringify({
      recentInvoices: contextData.invoices.slice(0, 20),
      topContacts: contextData.contacts.slice(0, 10)
    });

    const systemInstruction = `
      Sen 'BizimHesap Lite' uygulamasının akıllı finans asistanısın. 
      Kullanıcı sana finansal verileri hakkında sorular soracak.
      Sana sağlanan JSON formatındaki veri setini analiz ederek Türkçe cevap ver.
      Cevapların kısa, öz ve profesyonel olsun. Finansal tavsiye vermekten kaçın, sadece veriyi yorumla.
      Eğer veri setinde cevap yoksa, bunu belirt.
      
      Veri Seti:
      ${dataContext}
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: question,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Low temperature for factual consistency
      }
    });

    return response.text || "Üzgünüm, şu an cevap veremiyorum.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Bir hata oluştu veya API anahtarı eksik. Lütfen daha sonra tekrar deneyiniz.";
  }
};

export const generateInvoiceDescription = async (keywords: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Bir fatura için şu anahtar kelimeleri kullanarak profesyonel bir hizmet/ürün açıklaması yaz: "${keywords}". Sadece açıklamayı döndür, başka metin ekleme.`,
    });
    return response.text || keywords;
  } catch (error) {
    return keywords;
  }
};