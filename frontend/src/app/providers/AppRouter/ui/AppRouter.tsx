import { BrowserRouter, Route, Routes } from 'react-router';
import { Home, Login } from '../../../../pages';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Login onLogin={(token: string, role: string) => {
          // Handle login logic here
        }} />} />
      </Routes>
    </BrowserRouter>
  );
};
