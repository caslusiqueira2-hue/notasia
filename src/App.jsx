import React, { useState } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { NotesView } from './views/NotesView';
import { AgendaView } from './views/AgendaView';
import { GoalsView } from './views/GoalsView';
import { ChatView } from './views/ChatView';
import { Toaster } from 'react-hot-toast';

function App() {
  const [activeTab, setActiveTab] = useState('notes');

  const renderContent = () => {
    switch (activeTab) {
      case 'notes': return <NotesView />;
      case 'agenda': return <AgendaView />;
      case 'goals': return <GoalsView />;
      case 'chat': return <ChatView />;
      default: return <NotesView />;
    }
  };

  return (
    <AuthProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
