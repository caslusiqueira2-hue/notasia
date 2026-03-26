import React, { useState } from 'react';
import { useNotes } from '../hooks/useData';
import { Plus, Target, CheckCircle2, ChevronRight, Sparkles, Trash2, X } from 'lucide-react';
import { generateActionPlan } from '../lib/gemini';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

export const GoalsView = () => {
  const { data: goals, loading, add, update, remove } = useNotes('goals');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', progress: 0, category: 'Pessoal' });

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title) return;
    try {
      await add({ ...newGoal, completed: false });
      setNewGoal({ title: '', progress: 0, category: 'Pessoal' });
      setIsModalOpen(false);
      toast.success('Meta criada!');
    } catch (err) {
      toast.error('Erro ao criar meta.');
    }
  };

  const handleGeneratePlan = async (title) => {
    const promise = generateActionPlan(title);
    toast.promise(promise, {
      loading: 'Gerando plano de ação com IA...',
      success: (data) => {
        // Here we could save the plan to a note or show it in a modal
        console.log(data);
        return 'Plano de ação gerado!';
      },
      error: 'Erro na IA.'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Minhas Metas</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Acompanhe seu progresso e atinja seus objetivos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Meta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="premium-card h-32 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="premium-card p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
                    <Target size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{goal.title}</h3>
                    <span className="text-xs text-slate-500 font-medium">{goal.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleGeneratePlan(goal.title)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-primary-600"
                    title="Gerar Plano de Ação AI"
                  >
                    <Sparkles size={18} />
                  </button>
                  <button 
                    onClick={() => remove(goal.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-rose-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500">Progresso</span>
                  <span className="text-primary-600">{goal.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-600 transition-all duration-1000" 
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                {[0, 25, 50, 75, 100].map(val => (
                  <button 
                    key={val}
                    onClick={() => update(goal.id, { progress: val, completed: val === 100 })}
                    className={clsx(
                      "flex-1 py-1 rounded text-[10px] font-bold border transition-all",
                      goal.progress === val 
                        ? "bg-primary-600 border-primary-600 text-white" 
                        : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 hover:border-primary-500"
                    )}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nova Meta</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Qual é seu objetivo?</label>
                <input 
                  autoFocus
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20"
                  value={newGoal.title}
                  onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="Ex: Aprender React em 3 meses"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Categoria</label>
                <select 
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20"
                  value={newGoal.category}
                  onChange={e => setNewGoal({...newGoal, category: e.target.value})}
                >
                  <option value="Pessoal">Pessoal</option>
                  <option value="Trabalho">Trabalho</option>
                  <option value="Estudos">Estudos</option>
                  <option value="Saúde">Saúde</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary py-3">Criar Meta</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary py-3">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
