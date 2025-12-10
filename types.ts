export enum Gender {
  Male = 'Masculino',
  Female = 'Feminino',
  Other = 'Outro'
}

export enum ActivityLevel {
  Sedentary = 'Sedentário (pouco ou nenhum exercício)',
  Light = 'Leve (exercício 1-3 dias/semana)',
  Moderate = 'Moderado (exercício 3-5 dias/semana)',
  Active = 'Ativo (exercício 6-7 dias/semana)',
  VeryActive = 'Muito Ativo (exercício físico intenso/trabalho físico)'
}

export enum Goal {
  LoseWeight = 'Perder Peso',
  Maintain = 'Manter Peso',
  GainMuscle = 'Ganhar Massa Muscular'
}

export interface UserProfile {
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
  goal: Goal;
  dietaryRestrictions: string; // Free text
  excludedFoods: string;
}

export interface MacroNutrients {
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealItem {
  name: string;
  portion: string;
}

export interface Meal {
  name: string; // Breakfast, Lunch, etc.
  time: string;
  items: MealItem[];
  calories: number;
  macros: MacroNutrients;
  tips: string;
}

export interface DietPlan {
  totalCalories: number;
  dailyMacros: MacroNutrients;
  meals: Meal[];
  waterIntake: number; // in liters
  summary: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface SavedDiet {
  id: string;
  userId: string;
  date: string;
  plan: DietPlan;
  profileSnapshot: UserProfile; // Para lembrar para qual perfil foi gerado
}