import { useState } from 'react';
import { AuthForm } from './components/AuthForm/AuthForm';
import { Chat } from './components/Chat/Chat';
import { useStatusSetupNotice } from './hooks/useStatusSetupNotice';
import {
  createApiSession,
  clearApiSession,
  getSavedInstanceId,
  restoreApiSession,
} from './utils/appSession';

function App() {
  const [api, setApi] = useState(restoreApiSession);
  const [statusSetupNotice, setStatusSetupNotice] = useState('');
  const idInstance = getSavedInstanceId();
  useStatusSetupNotice(api, idInstance, setStatusSetupNotice);

  const handleAuth = (idInstance: string, apiTokenInstance: string) => {
    setApi(createApiSession(idInstance, apiTokenInstance));
  }

  const handleLogout = () => {
    clearApiSession();
    setStatusSetupNotice('');
    setApi(null);
  }

  if (!api) {
    return <AuthForm onSubmit={handleAuth} />;
  }

  return (
    <Chat
      api={api}
      onLogout={handleLogout}
      statusSetupNotice={statusSetupNotice}
    />
  );
}

export default App;