import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
