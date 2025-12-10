import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { FormWizard } from './components/FormWizard';
import { DietPlanDisplay } from './components/DietPlanDisplay';
import { LoadingScreen } from './components/LoadingScreen';
import { FoodScanner } from './components/FoodScanner';
import { AuthScreen } from './components/AuthScreen';
import { History } from './components/History';
import { generateDietPlan } from './services/geminiService';
import { dbSaveDiet } from './services/database';
import { useAuth } from './context/AuthContext';
import { UserProfile, DietPlan, SavedDiet } from './types';
import { Salad, Camera, Utensils, LogOut, History as HistoryIcon, User, AlertCircle, Settings, Save } from 'lucide-react';

type ViewState = 'HOME' | 'FORM' | 'LOADING' | 'RESULT' | 'ERROR';
type ActiveTab = 'DIET' | 'SCANNER' | 'HISTORY';

const App: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();

  const [view, setView] = useState<ViewState>('HOME');
  const [activeTab, setActiveTab] = useState<ActiveTab>('DIET');
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [manualApiKey, setManualApiKey] = useState('');

  // Se estiver carregando sessão, mostra spinner simples
  if (authLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><LoadingScreen /></div>;
  }

  // Se não estiver logado, mostra tela de Auth
  if (!user) {
    return <AuthScreen />;
  }

  const handleStart = () => {
    setView('FORM');
  };

  const handleFormSubmit = async (data: UserProfile) => {
    setView('LOADING');
    try {
      const plan = await generateDietPlan(data);
      
      // Salva automaticamente no "Banco de Dados" ao gerar com sucesso
      if (user) {
        dbSaveDiet(user.id, plan, data).then(() => {
             // Silencioso ou Toast
             console.log("Dieta salva");
        }).catch(err => {
             console.error("Erro ao salvar no banco (não bloqueante):", err);
        });
      }

      setDietPlan(plan);
      setView('RESULT');
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Ocorreu um erro ao gerar sua dieta.");
      setView('ERROR');
    }
  };

  const handleReset = () => {
    setDietPlan(null);
    setView('HOME');
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'DIET' && view === 'HOME') {
        // Keep as home
    } else if (tab === 'DIET') {
        // Se voltar pra tab de dieta e não tiver plano, vai pra home
        if (!dietPlan) setView('HOME');
    }
  };

  const handleHistorySelect = (savedDiet: SavedDiet) => {
    setDietPlan(savedDiet.plan);
    setActiveTab('DIET');
    setView('RESULT');
  };

  const handleSaveApiKey = () => {
    if (manualApiKey.trim().startsWith('AIza')) {
        localStorage.setItem('gemini_api_key', manualApiKey.trim());
        window.location.reload();
    } else {
        alert("A chave API parece inválida. Ela deve começar com 'AIza'.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => { setActiveTab('DIET'); handleReset(); }}>
              <Salad className="h-8 w-8 text-emerald-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 tracking-tight hidden sm:inline">Nexa<span className="text-emerald-600">Nutri</span></span>
            </div>
            
            {/* Tabs Navigation - Centralized for Desktop */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg absolute left-1/2 transform -translate-x-1/2 hidden md:flex">
                <button
                    onClick={() => handleTabChange('DIET')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'DIET' 
                        ? 'bg-white text-emerald-700 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Utensils className="w-4 h-4 mr-2" />
                    Plano
                </button>
                <button
                    onClick={() => handleTabChange('SCANNER')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'SCANNER' 
                        ? 'bg-white text-emerald-700 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Camera className="w-4 h-4 mr-2" />
                    Scanner
                </button>
                <button
                    onClick={() => handleTabChange('HISTORY')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'HISTORY' 
                        ? 'bg-white text-emerald-700 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <HistoryIcon className="w-4 h-4 mr-2" />
                    Histórico
                </button>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm font-medium text-gray-700">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 mr-2 border border-emerald-200">
                        <User className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:inline">{user.name}</span>
                </div>
                <button 
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Sair"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
          </div>
          
          {/* Mobile Tabs */}
          <div className="md:hidden flex space-x-1 bg-gray-100 p-1 rounded-lg mt-2 mb-2 overflow-x-auto">
             <button onClick={() => handleTabChange('DIET')} className={`flex-1 flex justify-center items-center px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap ${activeTab === 'DIET' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}>
                <Utensils className="w-3 h-3 mr-1" /> Plano
             </button>
             <button onClick={() => handleTabChange('SCANNER')} className={`flex-1 flex justify-center items-center px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap ${activeTab === 'SCANNER' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}>
                <Camera className="w-3 h-3 mr-1" /> Scanner
             </button>
             <button onClick={() => handleTabChange('HISTORY')} className={`flex-1 flex justify-center items-center px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap ${activeTab === 'HISTORY' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}>
                <HistoryIcon className="w-3 h-3 mr-1" /> Histórico
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {activeTab === 'DIET' && (
            <>
                {view === 'HOME' && <Hero onStart={handleStart} />}
                
                {view === 'FORM' && (
                <div className="animate-fade-in-up">
                    <FormWizard onSubmit={handleFormSubmit} onCancel={() => setView('HOME')} />
                </div>
                )}

                {view === 'LOADING' && <LoadingScreen />}

                {view === 'RESULT' && dietPlan && (
                <DietPlanDisplay plan={dietPlan} onReset={handleReset} />
                )}

                {view === 'ERROR' && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
                    <div className="bg-