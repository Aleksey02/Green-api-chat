import { useState } from 'react';
import { AuthForm } from './components/AuthForm/AuthForm';
import { Chat } from './components/Chat/Chat';
import { createGreenApi } from './services/greenApi';

function App() {
  const [api, setApi] = useState<ReturnType<
    typeof createGreenApi
  > | null>(null);

  function handleAuth(
    idInstance: string,
    apiTokenInstance: string
  ) {
    const greenApi = createGreenApi({
      idInstance,
      apiTokenInstance,
    });

    setApi(greenApi);
  }

  function handleLogout() {
    setApi(null);
  }

  if (!api) {
    return <AuthForm onSubmit={handleAuth} />;
  }

  return (
    <Chat
      api={api}
      onLogout={handleLogout}
    />
  );
}

export default App;