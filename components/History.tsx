import React, { useEffect, useState } from 'react';
import { dbGetDiets, dbDeleteDiet } from '../services/database';
import { useAuth } from '../context/AuthContext';
import { SavedDiet } from '../types';
import { Calendar, Trash2, ChevronRight, Utensils, Flame } from 'lucide-react';

interface HistoryProps {
  onSelectDiet: (diet: SavedDiet) => void;
}

export const History: React.FC<HistoryProps> = ({ onSelectDiet }) => {
  const { user } = useAuth();
  const [diets, setDiets] = useState<SavedDiet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    if (user) {
      setLoading(true);
      const data = await dbGetDiets(user.id);
      setDiets(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este plano?')) {
        await dbDeleteDiet(id);
        loadHistory();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Calendar className="w-6 h-6 mr-2 text-emerald-600" />
        Seu Histórico de Planos
      </h2>

      {diets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum plano alimentar salvo ainda.</p>
            <p className="text-sm text-gray-400 mt-1">Crie seu primeiro plano na aba "Plano Alimentar".</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {diets.map((diet) => (
            <div 
                key={diet.id}
                onClick={() => onSelectDiet(diet)}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center group"
            >
                <div className="flex-1">
                    <div className="flex items-center mb-1">
                        <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full mr-2">
                            {diet.plan.totalCalories} kcal
                        </span>
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                            {diet.profileSnapshot.goal}
                        </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-emerald-700 transition-colors">
                        Plano de {formatDate(diet.date)}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                        {diet.plan.summary}
                    </p>
                </div>
                
                <div className="flex items-center ml-4">
                     <button
                        onClick={(e) => handleDelete(e, diet.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors mr-2"
                        title="Excluir"
                     >
                        <Trash2 className="w-5 h-5" />
                     </button>
                     <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500" />
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};