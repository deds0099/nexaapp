import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, DietPlan } from "../types";

// --- ÁREA DE CONFIGURAÇÃO MANUAL ---
// Se você não conseguir configurar o Vercel, pode colar sua chave aqui temporariamente (não recomendado para projetos públicos, mas funciona)
const HARDCODED_API_KEY = "AIzaSyBjs3EU4L2SNZOMRpzDcOvI-mQCqDMfTFM"; 
// -----------------------------------

// Define the response schema for strict JSON output
const dietPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    totalCalories: { type: Type.NUMBER, description: "Total daily calories target" },
    waterIntake: { type: Type.NUMBER, description: "Recommended daily water intake in liters" },
    summary: { type: Type.STRING, description: "A brief motivational summary of the plan (max 2 sentences)" },
    dailyMacros: {
      type: Type.OBJECT,
      properties: {
        protein: { type: Type.NUMBER, description: "Total protein in grams" },
        carbs: { type: Type.NUMBER, description: "Total carbs in grams" },
        fats: { type: Type.NUMBER, description: "Total fats in grams" }
      },
      required: ["protein", "carbs", "fats"]
    },
    meals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the meal (e.g., Café da Manhã)" },
          time: { type: Type.STRING, description: "Suggested time (e.g., 08:00)" },
          calories: { type: Type.NUMBER, description: "Calories for this meal" },
          tips: { type: Type.STRING, description: "Preparation tip or benefit" },
          macros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER }
            },
            required: ["protein", "carbs", "fats"]
          },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of food item" },
                portion: { type: Type.STRING, description: "Portion size (e.g., 2 ovos, 100g de frango)" }
              },
              required: ["name", "portion"]
            }
          }
        },
        required: ["name", "time", "items", "calories", "macros", "tips"]
      }
    }
  },
  required: ["totalCalories", "waterIntake", "summary", "dailyMacros", "meals"]
};

export const generateDietPlan = async (user: UserProfile): Promise<DietPlan> => {
  console.log("Iniciando geração de dieta...");
  
  // ORDEM DE PRIORIDADE DA CHAVE:
  // 1. Chave Hardcoded (código)
  // 2. Variável de Ambiente (Vercel/Local)
  // 3. LocalStorage (Configuração manual pela UI)
  const apiKey = HARDCODED_API_KEY ||
                 process.env.API_KEY || 
                 (window as any).process?.env?.API_KEY || 
                 localStorage.getItem('gemini_api_key');
  
  if (!apiKey || apiKey.includes("undefined") || apiKey === "") {
    console.error("CRITICAL: API Key not found.");
    throw new Error("MISSING_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Atue como um nutricionista esportivo e clínico de elite. Crie um plano alimentar diário personalizado.
    
    Perfil do Paciente:
    - Idade: ${user.age} anos
    - Gênero: ${user.gender}
    - Altura: ${user.height} cm
    - Peso: ${user.weight} kg
    - Nível de Atividade: ${user.activityLevel}
    - Objetivo Principal: ${user.goal}
    - Restrições Alimentares: ${user.dietaryRestrictions || "Nenhuma"}
    - Alimentos Excluídos/Não gosta: ${user.excludedFoods || "Nenhum"}

    Requisitos:
    1. Calcule as calorias basais e o gasto energético total para atingir o objetivo (déficit para perda, superávit para ganho).
    2. Distribua os macronutrientes de forma equilibrada.
    3. Crie refeições variadas e práticas adaptadas ao paladar brasileiro.
    4. O output deve ser estritamente em Português do Brasil.
  `;

  try {
    // Usando gemini-2.5-flash para maior estabilidade e velocidade em produção
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dietPlanSchema,
        temperature: 0.7,
      }
    });

    let text = response.text;
    if (!text) {
      throw new Error("A IA não retornou nenhum texto.");
    }

    // Limpeza de segurança para garantir JSON válido (remove blocos markdown ```json ... ``` se houver)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    console.log("Dieta gerada com sucesso!");
    return JSON.parse(text) as DietPlan;
  } catch (error: any) {
    console.error("Erro detalhado ao gerar dieta:", error);
    
    // Tratamento específico de erros comuns
    if (error.message?.includes("API key")) {
      throw new Error("INVALID_API_KEY");
    }
    if (error.message?.includes("429")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    if (error.message?.includes("503")) {
      throw new Error("MODEL_OVERLOADED");
    }

    throw error;
  }
};