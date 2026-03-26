import { 
  Plus, 
  Sparkles,
  BarChart3,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getProductivitySummary } from '../lib/gemini';
import { useNotes } from '../hooks/useData';
import toast from 'react-hot-toast';

const cn = (...inputs) => twMerge(clsx(inputs));

const NavItem = ({ icon: Icon, label, active, onClick, mobile }) => {
  if (mobile) {
    return (
      <button 
        onClick={onClick}
        className={cn(
          "bottom-nav-item",
          active && "bottom-nav-item-active"
        )}
      >
        <Icon size={24} />
        <span className="text-[10px] mt-1">{label}</span>
      </button>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={cn(
        "sidebar-item w-full",
        active && "sidebar-item-active"
      )}
    >
      <Icon size={20} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
};

export const Layout = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { data: notes } = useNotes('notes');
  const { data: goals } = useNotes('goals');

  const handleSummary = async () => {
    if (!notes.length && !goals.length) {
      toast.error('Adicione algumas notas ou metas primeiro!');
      return;
    }
    setIsSummarizing(true);
    const toastId = toast.loading('Gerando resumo de produtividade...');
    try {
      const summary = await getProductivitySummary(notes, goals);
      toast.success(summary, { id: toastId, duration: 6000 });
    } catch (err) {
      toast.error('Erro ao gerar resumo.', { id: toastId });
    } finally {
      setIsSummarizing(false);
    }
  };

  const tabs = [
    { id: 'notes', label: 'Notas', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'chat', label: 'IA Chat', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className={cn(
        "hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300",
        !isSidebarOpen && "w-20"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <Sparkles size={24} />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">SmartNotes IA</span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {tabs.map((tab) => (
            <NavItem 
              key={tab.id}
              icon={tab.icon}
              label={isSidebarOpen ? tab.label : ''}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </nav>

        <div className="px-3 pb-4 space-y-1">
          <button 
            onClick={handleSummary}
            disabled={isSummarizing}
            className="sidebar-item w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
          >
            {isSummarizing ? <Loader2 size={20} className="animate-spin" /> : <BarChart3 size={20} />}
            {isSidebarOpen && <span>Resumo Geral</span>}
          </button>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-600">
              U
            </div>
            {isSidebarOpen && <span>Usuário Anônimo</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden pb-20 md:pb-0">
        <header className="md:hidden p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="font-bold text-lg">SmartNotes</span>
          </div>
          <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Plus size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around p-2 z-50">
        {tabs.map((tab) => (
          <NavItem 
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            mobile
          />
        ))}
      </nav>
    </div>
  );
};
