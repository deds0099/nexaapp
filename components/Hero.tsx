import React from 'react';
import { ArrowRight, Activity, Utensils, Sparkles } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Sua dieta perfeita</span>{' '}
                <span className="block text-emerald-600 xl:inline">e personalizada</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                NexaNutri cria planos alimentares otimizados instantaneamente baseados no seu corpo, rotina e objetivos. Sem dietas genéricas, totalmente adaptado a você.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <button
                    onClick={onStart}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 md:py-4 md:text-lg transition-all"
                  >
                    Criar meu plano grátis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-50 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-4 p-8 opacity-80">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
                <Activity className="w-12 h-12 text-emerald-500 mb-2" />
                <span className="font-semibold text-gray-700">Foco em Saúde</span>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center mt-8">
                <Utensils className="w-12 h-12 text-orange-500 mb-2" />
                <span className="font-semibold text-gray-700">Cardápio Real</span>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
                <Sparkles className="w-12 h-12 text-purple-500 mb-2" />
                <span className="font-semibold text-gray-700">Alta Tecnologia</span>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center mt-8">
                <div className="text-3xl font-bold text-gray-800">100%</div>
                <span className="font-semibold text-gray-600 text-sm">Personalizado</span>
            </div>
        </div>
      </div>
    </div>
  );
};