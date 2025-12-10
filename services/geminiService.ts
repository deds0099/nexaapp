import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, DietPlan } from "../types";

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
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
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
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dietPlanSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as DietPlan;
  } catch (error) {
    console.error("Error generating diet plan:", error);
    throw error;
  }
};