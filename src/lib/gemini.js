import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const getModel = (modelName = "gemini-2.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

export const processOCR = async (fileBase64, mimeType) => {
  const model = getModel("gemini-2.5-flash");
  const prompt = `
    Analyze the provided image/document. 
    1. Extract the text content.
    2. Suggest a concise and professional Title.
    3. Classify into one of these Tags: Geral, Trabalho, Pessoal, Estudos.
    4. Classify Urgency: low (De boa), medium (Média), high (Urgente).
    
    Return ONLY a JSON object with this format:
    { "title": "...", "content": "...", "category": "...", "urgency": "low/medium/high" }
  `;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: fileBase64,
        mimeType: mimeType
      }
    }
  ]);

  const textResponse = result.response.text();
  // Extract JSON from response (sometimes Gemini wraps it in code blocks)
  const jsonMatch = textResponse.match(/\{.*\}/s);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
};

export const getProductivitySummary = async (notes, goals) => {
  const model = getModel();
  const context = `
    Notes: ${JSON.stringify(notes.map(n => ({ t: n.title, c: n.content })))}
    Goals: ${JSON.stringify(goals.map(g => ({ t: g.title, p: g.progress })))}
  `;
  const prompt = `Based on these notes and goals, provide a very brief (2-3 sentences) productivity summary/briefing for the user. Be encouraging.`;
  const result = await model.generateContent([prompt, context]);
  return result.response.text();
};

export const refineText = async (text) => {
  const model = getModel();
  const prompt = `Professionalize the following text, making it more formal and clear, while maintaining the original meaning: "${text}"`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const generateActionPlan = async (goal) => {
  const model = getModel();
  const prompt = `Generate a practical 5-step action plan to achieve the following goal: "${goal}". Be concise and actionable.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};
