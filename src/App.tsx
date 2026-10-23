import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import { restoreSession } from './store/authSlice';
import ProtectedRoute from './router/ProtectedRoute';
// Landing page is hidden for now; restore this import and the route below to bring it back.
// import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/LoginPage/LoginPage';
import BoardsPage from './pages/BoardsPage/BoardsPage';
import ToastHost from './components/ToastHost/ToastHost';

function AppInitializer() {
  useEffect(() => {
    store.dispatch(restoreSession());
  }, []);
  return null;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <AppInitializer />
      <Routes>
        {/* <Route path="/landing-page" element={<LandingPage />} /> */}
        <Route path="/landing-page" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<BoardsPage />} />
          <Route path="/:boardId" element={<BoardsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
      <ToastHost />
    </Provider>
  );
}
