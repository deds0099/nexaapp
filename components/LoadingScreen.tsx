import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-emerald-100 rounded-full animate-spin border-t-emerald-600"></div>
        <Loader2 className="w-8 h-8 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      <h2 className="mt-8 text-2xl font-bold text-gray-800 text-center">Criando seu plano alimentar...</h2>
      <p className="mt-2 text-gray-500 text-center max-w-md">
        Analisando seu perfil, calculando necessidades calóricas e selecionando os melhores alimentos para o seu objetivo.
      </p>
      
      <div className="mt-8 space-y-2 w-64">
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 animate-progress origin-left"></div>
        </div>
      </div>
      <style>{`
        @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
        }
        .animate-progress {
            animation: progress 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};