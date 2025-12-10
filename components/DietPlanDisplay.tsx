import React from 'react';
import { DietPlan, Meal, MacroNutrients } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Clock, Flame, Info, Droplets, ArrowLeft } from 'lucide-react';

interface DietPlanDisplayProps {
  plan: DietPlan;
  onReset: () => void;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B']; // Emerald, Blue, Amber

const MacroChart = ({ macros }: { macros: MacroNutrients }) => {
  const data = [
    { name: 'Proteína', value: macros.protein },
    { name: 'Carboidrato', value: macros.carbs },
    { name: 'Gordura', value: macros.fats },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
             formatter={(value: number) => [`${value}g`, '']}
             contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DietPlanDisplay: React.FC<DietPlanDisplayProps> = ({ plan, onReset }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <button 
        onClick={onReset}
        className="mb-6 flex items-center text-gray-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Novo Plano
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Macros */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-50">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Resumo Nutricional</h2>
            <div className="flex items-center justify-between mb-6 bg-emerald-50 p-4 rounded-xl">
                <div>
                    <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider">Calorias Totais</p>
                    <p className="text-3xl font-extrabold text-emerald-700">{plan.totalCalories}</p>
                    <p className="text-xs text-emerald-600">kcal/dia</p>
                </div>
                <Flame className="w-10 h-10 text-emerald-500" />
            </div>
            
            <h3 className="text-sm font-semibold text-gray-600 mb-2 text-center">Distribuição de Macros</h3>
            <MacroChart macros={plan.dailyMacros} />
            
            <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                    <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>Proteína</span>
                    <span className="font-bold">{plan.dailyMacros.protein}g</span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                    <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>Carboidrato</span>
                    <span className="font-bold">{plan.dailyMacros.carbs}g</span>
                </div>
                <div className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                    <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>Gordura</span>
                    <span className="font-bold">{plan.dailyMacros.fats}g</span>
                </div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center mb-2">
                    <Droplets className="w-6 h-6 mr-2 opacity-80" />
                    <h3 className="font-bold text-lg">Hidratação</h3>
                </div>
                <p className="text-4xl font-bold mb-1">{plan.waterIntake}L</p>
                <p className="text-blue-100 text-sm">meta diária de água</p>
             </div>
             <div className="absolute -bottom-4 -right-4 text-blue-500 opacity-20">
                <Droplets className="w-32 h-32" />
             </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2 text-gray-500" />
                Nota do Nutri
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed italic">
                "{plan.summary}"
            </p>
          </div>
        </div>

        {/* Right Column: Meals */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Seu Cardápio do Dia</h2>
          
          <div className="space-y-4">
            {plan.meals.map((meal, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center">
                            <Clock className="w-5 h-5 text-emerald-500 mr-3" />
                            <div>
                                <h3 className="font-bold text-gray-800">{meal.name}</h3>
                                <span className="text-xs font-medium text-gray-500">{meal.time}</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <span className="text-emerald-600 font-bold text-sm">{meal.calories} kcal</span>
                        </div>
                    </div>
                    <div className="p-6">
                        <ul className="space-y-3 mb-4">
                            {meal.items.map((item, idx) => (
                                <li key={idx} className="flex items-start">
                                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-emerald-400 mr-3"></div>
                                    <span className="text-gray-700">
                                        <span className="font-medium text-gray-900">{item.name}</span>
                                        <span className="text-gray-400 mx-2">-</span>
                                        <span className="text-gray-500 text-sm">{item.portion}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                        
                        <div className="flex items-center bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 border border-yellow-100">
                            <span className="font-bold mr-2">Dica:</span> {meal.tips}
                        </div>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
