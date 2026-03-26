import React, { useState } from 'react';
import { useNotes } from '../hooks/useData';
import { 
  Plus, 
  Search, 
  X, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  Circle,
  MoreVertical,
  FileUp,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { refineText, processOCR } from '../lib/gemini';
import toast from 'react-hot-toast';

const UrgencyBadge = ({ level }) => {
  const styles = {
    low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    high: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
  };
  return (
    <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", styles[level])}>
      {level === 'low' ? 'De Boa' : level === 'medium' ? 'Médio' : 'Urgente'}
    </span>
  );
};

export const NotesView = () => {
  const { data: notes, loading, add, update, remove } = useNotes('notes');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'Geral', urgency: 'low', completed: false });

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) return;
    try {
      await add(newNote);
      setNewNote({ title: '', content: '', category: 'Geral', urgency: 'low', completed: false });
      setIsModalOpen(false);
      toast.success('Nota adicionada!');
    } catch (err) {
      toast.error('Erro ao adicionar nota.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsOCRProcessing(true);
    const toastId = toast.loading('Processando arquivo com IA...');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        const result = await processOCR(base64, file.type);
        if (result) {
          setNewNote(prev => ({ ...prev, ...result }));
          setIsModalOpen(true);
          toast.success('Texto extraído com sucesso!', { id: toastId });
        } else {
          toast.error('Não foi possível extrair texto.', { id: toastId });
        }
        setIsOCRProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error('Erro no processamento OCR.', { id: toastId });
      setIsOCRProcessing(false);
    }
  };

  const handleSpeech = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'pt-BR';
    window.speechSynthesis.speak(speech);
    toast('Lendo nota...', { icon: '🔊' });
  };

  const handleRefine = async (id, currentContent) => {
    try {
      const promise = refineText(currentContent);
      toast.promise(promise, {
        loading: 'Profissionalizando com IA...',
        success: (data) => {
          update(id, { content: data });
          return 'Texto profissionalizado!';
        },
        error: 'Erro na IA.'
      });
    } catch (err) {
      toast.error('Erro ao chamar Gemini.');
    }
  };

  const filteredNotes = (notes || []).filter(n => 
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Minhas Notas</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie suas ideias e lembretes com IA.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar notas..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <input 
            type="file" 
            id="ocr-upload" 
            className="hidden" 
            onChange={handleFileUpload}
            accept="image/*,application/pdf"
          />
          <button 
            onClick={() => document.getElementById('ocr-upload').click()}
            disabled={isOCRProcessing}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all disabled:opacity-50 shadow-sm"
            title="Upload Image/PDF for OCR"
          >
            {isOCRProcessing ? <Loader2 size={20} className="animate-spin" /> : <FileUp size={20} />}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nova Nota</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="premium-card h-48 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))
        ) : (
          filteredNotes.map((note) => (
            <div 
              key={note.id} 
              className={clsx(
                "premium-card p-5 relative group overflow-hidden",
                `urgency-${note.urgency}`,
                note.completed && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <UrgencyBadge level={note.urgency} />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleRefine(note.id, note.content)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-primary-600"
                    title="Profissionalizar com IA"
                  >
                    <Sparkles size={16} />
                  </button>
                  <button 
                    onClick={() => handleSpeech(note.content)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                    title="Ouvir Nota"
                  >
                    <Volume2 size={16} />
                  </button>
                  <button 
                    onClick={() => remove(note.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <button onClick={() => update(note.id, { completed: !note.completed })}>
                  {note.completed ? (
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  ) : (
                    <Circle size={20} className="text-slate-300 dark:text-slate-600" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className={clsx(
                    "font-bold text-slate-900 dark:text-white truncate mb-1",
                    note.completed && "line-through"
                  )}>
                    {note.title}
                  </h3>
                  <p className={clsx(
                    "text-sm text-slate-600 dark:text-slate-400 line-clamp-3",
                    note.completed && "line-through"
                  )}>
                    {note.content}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-500">{note.category}</span>
                <span>{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ''}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nova Nota</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Título</label>
                <input 
                  autoFocus
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20"
                  value={newNote.title}
                  onChange={e => setNewNote({...newNote, title: e.target.value})}
                  placeholder="Ex: Reunião de Planejamento"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Conteúdo</label>
                <textarea 
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl h-32 resize-none focus:ring-2 focus:ring-primary-500/20"
                  value={newNote.content}
                  onChange={e => setNewNote({...newNote, content: e.target.value})}
                  placeholder="O que você está pensando?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Urgência</label>
                  <select 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20"
                    value={newNote.urgency}
                    onChange={e => setNewNote({...newNote, urgency: e.target.value})}
                  >
                    <option value="low">De Boa (Baixa)</option>
                    <option value="medium">Médio (Média)</option>
                    <option value="high">Urgente (Alta)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Categoria</label>
                  <select 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20"
                    value={newNote.category}
                    onChange={e => setNewNote({...newNote, category: e.target.value})}
                  >
                    <option value="Geral">Geral</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Estudos">Estudos</option>
                    <option value="Pessoal">Pessoal</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary py-3">Criar Nota</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary py-3">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
