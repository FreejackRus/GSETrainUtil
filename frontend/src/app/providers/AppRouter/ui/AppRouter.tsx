import { BrowserRouter, Route, Routes } from 'react-router';
import { Home } from '../../../../pages/Home';
import { Login } from '../../../../pages/Login';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};
