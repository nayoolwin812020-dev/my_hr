import { GoogleGenAI, Type } from "@google/genai";
import { AttendanceRecord, PayrollSummary } from "../types";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateLeaveReason = async (type: string, dates: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `Write a professional short leave request reason for ${type} leave for the dates: ${dates}. Keep it under 30 words.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error generating leave reason:", error);
    return "I would like to request leave for personal reasons.";
  }
};

export const analyzePayroll = async (history: AttendanceRecord[], payroll: PayrollSummary): Promise<string> => {
  try {
    const ai = getAiClient();
    const historySummary = history.map(h => `${h.date}: ${h.status}`).join('\n');
    
    const prompt = `
      Analyze this employee's attendance and payroll data.
      Payroll Summary: Net Pay $${payroll.netPay}, Total Hours: ${payroll.totalHours}, Overtime: ${payroll.overtimeHours}.
      Recent Attendance:
      ${historySummary}
      
      Provide a 2-sentence summary of their performance and pay efficiency. Be encouraging but factual.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error analyzing payroll:", error);
    return "Payroll data looks consistent with your tracked hours.";
  }
};

export const verifyUserIdentity = async (capturedImageBase64: string, referenceImageUrl: string): Promise<{ match: boolean; reason: string }> => {
  try {
    // 1. Convert Reference URL to Base64
    let referenceBase64 = '';
    try {
        const response = await fetch(referenceImageUrl, { mode: 'cors' });
        if (!response.ok) throw new Error("Failed to fetch avatar");
        const blob = await response.blob();
        referenceBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const res = reader.result as string;
                // remove metadata prefix if present, though split works generally
                resolve(res.split(',')[1]); 
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn("Could not fetch reference image for comparison (CORS?):", e);
        return { match: false, reason: "Unable to access profile photo for verification." };
    }

    const capturedBase64 = capturedImageBase64.split(',')[1];
    const ai = getAiClient();
    
    const prompt = "Compare the person in the first image (captured photo) with the person in the second image (reference profile photo). Are they the same person? Reply in JSON with a boolean 'match' and a short 'reason'. If the faces are clearly different or one is not a person, match is false.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: capturedBase64 } },
          { inlineData: { mimeType: 'image/jpeg', data: referenceBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            match: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
        match: !!result.match,
        reason: result.reason || "Verification failed."
    };

  } catch (error) {
    console.error("Identity verification error:", error);
    return { match: false, reason: "AI verification service unavailable." };
  }
};
