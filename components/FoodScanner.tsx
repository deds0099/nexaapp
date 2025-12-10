import React, { useState, useRef } from 'react';
import { Upload, Camera, X, Loader2, ScanLine, Info, ChevronDown, ChevronUp, Droplets, Leaf, Activity, AlertTriangle, Bug } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Interface baseada no JSON fornecido pelo usuário
interface N8NResponse {
  descricao: string;
  calorias_totais_kcal: number | string;
  macro_nutrientes: {
    proteinas_g: number | string;
    carboidratos_g: number | string;
    gorduras_totais_g: number | string;
  };
  detalhes?: {
    fibras_g: number | string;
    acucares_g: number | string;
    sodio_mg: number | string;
    gorduras_saturadas_g: number | string;
  };
  ingredientes?: Array<{
    name: string;
    quantity: string;
    calories: number | string;
    protein?: number | string;
    carbs?: number | string;
    fat?: number | string;
  }>;
  aviso_precisao?: string;
}

export const FoodScanner: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<N8NResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugData, setDebugData] = useState<any>(null); // Para mostrar o que veio do servidor em caso de erro
  const [showIngredients, setShowIngredients] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleFile = (file?: File) => {
    if (file && file.type.startsWith('image/')) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError("A imagem deve ter no máximo 10MB.");
            return;
        }
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResult(null);
        setError(null);
        setDebugData(null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setDebugData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Função auxiliar para limpar números que vêm como string (ex: "100g" -> 100)
  const cleanNumber = (val: string | number | undefined): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    // Remove tudo que não for dígito ou ponto decimal
    const cleaned = String(val).replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);
    setDebugData(null);

    const formData = new FormData();
    formData.append('file', selectedImage); 

    try {
      // Nota: Webhooks de teste do N8N as vezes precisam estar "ouvindo" (Listening)
      const response = await fetch('https://webhook.nexaapp.online/webhook-test/nexaapp', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }

      let data = await response.json();
      setDebugData(data); // Salva o raw data para debug

      // LÓGICA DE TRATAMENTO DE RESPOSTA DO N8N
      let processedData = data;

      // 1. Se for array, pega o primeiro item
      if (Array.isArray(data)) {
        processedData = data[0];
      }
      
      // 2. Tenta desembrulhar propriedades comuns do N8N (output, body, json, data)
      if (processedData && typeof processedData === 'object') {
        if (processedData.output && typeof processedData.output === 'object') {
            // Caso comum: Dados dentro de 'output'
            processedData = processedData.output;
        } else if (processedData.body && typeof processedData.body === 'object') {
            // Caso comum: Dados dentro de 'body'
            processedData = processedData.body;
        } else if (processedData.json && typeof processedData.json === 'object') {
            // Caso comum: Dados dentro de 'json'
            processedData = processedData.json;
        } else if (processedData.data && typeof processedData.data === 'object') {
            processedData = processedData.data;
        }
      }

      // 3. Fallback: Se for string JSON (acontece se o N8N retornar o JSON como string dentro de um campo)
      if (typeof processedData === 'string') {
          try {
              processedData = JSON.parse(processedData);
          } catch (e) {
              console.warn("Falha ao parsear string JSON secundária");
          }
      }

      // Validação mínima para ver se temos os dados necessários
      if (!processedData || (!processedData.calorias_totais_kcal && !processedData.macro_nutrientes)) {
         throw new Error("O N8N respondeu, mas os dados não estão no formato esperado. Veja os detalhes abaixo.");
      }

      setResult(processedData as N8NResponse);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Falha ao analisar a imagem.");
    } finally {
      setIsLoading(false);
    }
  };

  const MacroCard = ({ label, value, color, icon: Icon }: any) => (
    <div className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden`}>
        <div className={`absolute top-0 right-0 p-2 opacity-10 ${color}`}>
            <Icon size={40} />
        </div>
        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{label}</span>
        <span className={`text-2xl font-bold ${color.replace('bg-', 'text-').replace('100', '600')}`}>
            {value}g
        </span>
    </div>
  );

  const DetailRow = ({ label, value, unit }: any) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
        <span className="text-gray-600 text-sm">{label}</span>
        <span className="font-medium text-gray-900">{value}{unit}</span>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;

    // Usar cleanNumber para garantir que temos números puros para os gráficos
    const calories = cleanNumber(result.calorias_totais_kcal);
    const protein = cleanNumber(result.macro_nutrientes?.proteinas_g);
    const carbs = cleanNumber(result.macro_nutrientes?.carboidratos_g);
    const fats = cleanNumber(result.macro_nutrientes?.gorduras_totais_g);

    const dataPie = [
        { name: 'Proteína', value: protein, color: '#10B981' },
        { name: 'Carboidratos', value: carbs, color: '#3B82F6' },
        { name: 'Gorduras', value: fats, color: '#F59E0B' },
    ].filter(i => i.value > 0);

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header com Calorias */}
            <div className="bg-emerald-600 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-emerald-100 font-medium text-lg mb-1">{result.descricao || "Alimento Identificado"}</h2>
                    <div className="flex items-baseline">
                        <span className="text-5xl font-extrabold">{calories}</span>
                        <span className="ml-2 text-xl opacity-90">kcal</span>
                    </div>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/2 opacity-10 pointer-events-none">
                     <Activity className="w-full h-full transform scale-150 translate-x-10" />
                </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-4">
                <MacroCard label="Proteína" value={protein} color="text-emerald-600" icon={Activity} />
                <MacroCard label="Carbs" value={carbs} color="text-blue-600" icon={Leaf} />
                <MacroCard label="Gordura" value={fats} color="text-amber-600" icon={Droplets} />
            </div>

            {/* Gráfico de Distribuição + Detalhes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <h3 className="text-gray-700 font-semibold mb-4 text-sm">Distribuição Calórica</h3>
                    {dataPie.length > 0 ? (
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dataPie}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {dataPie.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-40 w-full flex items-center justify-center text-gray-400 text-xs text-center">
                            Sem dados suficientes para gráfico
                        </div>
                    )}
                    
                    <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
                        {dataPie.map(d => (
                            <div key={d.name} className="flex items-center">
                                <span className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: d.color}}></span>
                                {d.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Micro Nutrientes / Detalhes */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-700 font-semibold mb-4 text-sm flex items-center">
                        <Info className="w-4 h-4 mr-2 text-gray-400" /> Detalhes Nutricionais
                    </h3>
                    <div className="space-y-1">
                        <DetailRow label="Fibras" value={cleanNumber(result.detalhes?.fibras_g)} unit="g" />
                        <DetailRow label="Açúcares" value={cleanNumber(result.detalhes?.acucares_g)} unit="g" />
                        <DetailRow label="Sódio" value={cleanNumber(result.detalhes?.sodio_mg)} unit="mg" />
                        <DetailRow label="Gorduras Saturadas" value={cleanNumber(result.detalhes?.gorduras_saturadas_g)} unit="g" />
                    </div>
                </div>
            </div>

            {/* Lista de Ingredientes */}
            {result.ingredientes && result.ingredientes.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button 
                        onClick={() => setShowIngredients(!showIngredients)}
                        className="w-full px-6 py-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
                    >
                        <h3 className="font-bold text-gray-800">Composição do Prato ({result.ingredientes.length})</h3>
                        {showIngredients ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </button>
                    
                    {showIngredients && (
                        <div className="divide-y divide-gray-100">
                            {result.ingredientes.map((item, idx) => (
                                <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600 text-sm">{cleanNumber(item.calories)} kcal</p>
                                        {(item.protein || item.carbs || item.fat) && (
                                            <p className="text-[10px] text-gray-400">
                                                P: {cleanNumber(item.protein)}g • C: {cleanNumber(item.carbs)}g • G: {cleanNumber(item.fat)}g
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Aviso de Precisão */}
            {result.aviso_precisao && (
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">{result.aviso_precisao}</p>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in-up">
      {!result && (
         <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Scanner de Alimentos</h1>
            <p className="text-lg text-gray-600">
            Fotografe seu prato e obtenha a tabela nutricional completa em segundos.
            </p>
        </div>
      )}

      <div className={`bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 transition-all ${result ? 'mt-0' : ''}`}>
        
        {/* Area de Upload - Se já tiver resultado, fica menor no topo */}
        {previewUrl && result ? (
             <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                 <div className="flex items-center">
                    <img src={previewUrl} alt="Mini preview" className="w-16 h-16 rounded-lg object-cover border border-gray-200 mr-4" />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-emerald-600 font-medium hover:underline"
                    >
                        Trocar foto
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept="image/*" 
                        className="hidden" 
                    />
                 </div>
                 <button 
                    onClick={handleRemoveImage}
                    className="text-gray-400 hover:text-red-500"
                 >
                    <X className="w-5 h-5" />
                 </button>
             </div>
        ) : !previewUrl ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors cursor-pointer group"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Camera className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Clique para enviar uma foto</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Arraste e solte o arquivo aqui ou selecione da galeria (JPG, PNG)</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              className="hidden" 
            />
            <button className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
              Selecionar Arquivo
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden bg-gray-100 max-h-[500px] flex items-center justify-center border border-gray-200">
              <img src={previewUrl} alt="Preview" className="max-w-full max-h-[500px] object-contain" />
              <button 
                onClick={handleRemoveImage}
                className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-gray-600 hover:text-red-500 shadow-md backdrop-blur-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!result && !isLoading && (
               <button
                onClick={handleAnalyze}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-emerald-200 transition-all flex items-center justify-center transform hover:-translate-y-1"
              >
                <ScanLine className="w-6 h-6 mr-2" />
                Analisar Calorias & Macros
              </button>
            )}
          </div>
        )}

        {isLoading && (
          <div className="mt-8 text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="relative inline-block">
                 <div className="w-16 h-16 border-4 border-emerald-100 rounded-full animate-spin border-t-emerald-600"></div>
                 <Loader2 className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-4">Analisando sua comida...</h3>
            <p className="text-gray-500 mt-2">Identificando ingredientes e calculando macros.</p>
          </div>
        )}

        {error && (
            <div className="mt-6">
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start shadow-sm mb-4">
                    <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Erro na análise</p>
                        <p className="text-sm">{error}</p>
                        <p className="text-xs mt-2 text-red-500">Se você está usando o n8n localmente ou em testes, verifique se o botão "Execute" está ativo ou se há erros de CORS no console.</p>
                    </div>
                </div>

                {debugData && (
                    <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                         <div className="flex items-center text-gray-400 mb-2 border-b border-gray-700 pb-2">
                             <Bug className="w-4 h-4 mr-2" />
                             <span className="text-xs font-mono uppercase">Resposta RAW do Servidor</span>
                         </div>
                         <pre className="text-green-400 text-xs font-mono">
                             {JSON.stringify(debugData, null, 2)}
                         </pre>
                    </div>
                )}
            </div>
        )}

        {result && (
          <div className="mt-2">
             {renderResult()}
          </div>
        )}
      </div>
    </div>
  );
};