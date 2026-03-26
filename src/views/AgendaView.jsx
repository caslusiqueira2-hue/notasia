import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { clsx } from 'clsx';

export const AgendaView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Minha Agenda</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Organize seus compromissos e prazos.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 font-bold text-slate-700 dark:text-slate-200 min-w-[140px] text-center capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => (
            <div 
              key={i} 
              className={clsx(
                "min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-slate-800 last:border-r-0 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30",
                !isSameMonth(day, monthStart) && "bg-slate-50/50 dark:bg-slate-900/50 text-slate-300 dark:text-slate-700",
                isSameDay(day, new Date()) && "bg-primary-50/30 dark:bg-primary-900/10"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={clsx(
                  "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                  isSameDay(day, new Date()) && "bg-primary-600 text-white shadow-sm"
                )}>
                  {format(day, 'd')}
                </span>
              </div>
              
              {/* Exemplo de compromisso */}
              {isSameDay(day, new Date()) && (
                <div className="mt-1 p-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-[10px] font-bold border-l-2 border-indigo-500 truncate">
                  <Clock size={10} className="inline mr-1 mb-0.5" />
                  Hoje: SmartNotes
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="premium-card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Clock size={18} className="text-primary-500" />
            Próximos Compromissos
          </h3>
          <div className="space-y-4 text-sm text-slate-500 italic">
            Nenhum compromisso pendente para os próximos dias.
          </div>
        </div>
        <div className="premium-card p-6 bg-primary-600 text-white border-none shadow-xl shadow-primary-500/20">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <CalendarIcon size={18} />
            Dica de Produtividade
          </h3>
          <p className="text-primary-100 text-sm leading-relaxed">
            Organize suas tarefas mais difíceis logo no início do mês para reduzir a ansiedade e aumentar seu foco.
          </p>
        </div>
      </div>
    </div>
  );
};
