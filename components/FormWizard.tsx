import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel, Goal } from '../types';
import { ChevronRight, ChevronLeft, Check, Weight, Ruler, User, Activity } from 'lucide-react';

interface FormWizardProps {
  onSubmit: (data: UserProfile) => void;
  onCancel: () => void;
}

export const FormWizard: React.FC<FormWizardProps> = ({ onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({
    age: 30,
    gender: Gender.Male,
    height: 170,
    weight: 70,
    activityLevel: ActivityLevel.Moderate,
    goal: Goal.LoseWeight,
    dietaryRestrictions: '',
    excludedFoods: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sobre Você</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gênero</label>
          <div className="flex space-x-4">
            {[Gender.Male, Gender.Female].map((g) => (
              <button
                key={g}
                onClick={() => handleChange('gender', g)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center transition-all ${
                  formData.gender === g
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Idade</label>
            <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', Number(e.target.value))}
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
                placeholder="Ex: 30"
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
            <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Weight className="h-5 w-5 text-gray-400" />
                </div>
                <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleChange('weight', Number(e.target.value))}
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
                placeholder="Ex: 70"
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
            <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Ruler className="h-5 w-5 text-gray-400" />
                </div>
                <input
                type="number"
                value={formData.height}
                onChange={(e) => handleChange('height', Number(e.target.value))}
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
                placeholder="Ex: 175"
                />
            </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nível de Atividade & Meta</h2>
      
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Quão ativo você é?</label>
        {Object.values(ActivityLevel).map((level) => (
          <button
            key={level}
            onClick={() => handleChange('activityLevel', level)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center ${
              formData.activityLevel === level
                ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                : 'border-gray-200 hover:border-emerald-200'
            }`}
          >
            <div className={`p-2 rounded-full mr-4 ${formData.activityLevel === level ? 'bg-emerald-200' : 'bg-gray-100'}`}>
                <Activity className={`w-5 h-5 ${formData.activityLevel === level ? 'text-emerald-700' : 'text-gray-500'}`} />
            </div>
            <span className={`font-medium ${formData.activityLevel === level ? 'text-emerald-900' : 'text-gray-700'}`}>
                {level}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">Qual seu objetivo principal?</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(Goal).map((g) => (
                <button
                    key={g}
                    onClick={() => handleChange('goal', g)}
                    className={`py-4 px-4 rounded-lg border-2 text-center transition-all ${
                    formData.goal === g
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                        : 'border-gray-200 hover:border-emerald-200 text-gray-700'
                    }`}
                >
                    {g}
                </button>
            ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferências Alimentares</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Restrições Dietéticas
            <span className="text-gray-400 font-normal ml-2">(Opcional)</span>
        </label>
        <textarea
          value={formData.dietaryRestrictions}
          onChange={(e) => handleChange('dietaryRestrictions', e.target.value)}
          className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
          rows={3}
          placeholder="Ex: Sou vegetariano, intolerante a lactose, alergia a amendoim..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Alimentos que você NÃO gosta/excluir
            <span className="text-gray-400 font-normal ml-2">(Opcional)</span>
        </label>
        <textarea
          value={formData.excludedFoods}
          onChange={(e) => handleChange('excludedFoods', e.target.value)}
          className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
          rows={3}
          placeholder="Ex: Não gosto de fígado, jiló, coentro..."
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
            A IA irá utilizar todas essas informações para calcular suas necessidades calóricas exatas e montar um cardápio compatível com sua rotina.
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
            <span className={`text-xs font-semibold tracking-wider uppercase ${step >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>Perfil</span>
            <span className={`text-xs font-semibold tracking-wider uppercase ${step >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>Objetivos</span>
            <span className={`text-xs font-semibold tracking-wider uppercase ${step >= 3 ? 'text-emerald-600' : 'text-gray-400'}`}>Preferências</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <div className="mt-10 flex justify-between pt-6 border-t border-gray-100">
            {step > 1 ? (
                <button
                    onClick={prevStep}
                    className="flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                </button>
            ) : (
                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700 px-4 py-2"
                >
                    Cancelar
                </button>
            )}

            {step < 3 ? (
                <button
                    onClick={nextStep}
                    className="ml-auto flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg shadow-emerald-200"
                >
                    Próximo <ChevronRight className="w-4 h-4 ml-2" />
                </button>
            ) : (
                <button
                    onClick={() => onSubmit(formData)}
                    className="ml-auto flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg shadow-emerald-200"
                >
                    Gerar Dieta <Check className="w-4 h-4 ml-2" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
