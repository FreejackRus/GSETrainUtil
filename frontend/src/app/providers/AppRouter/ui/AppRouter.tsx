import { BrowserRouter, Route, Routes } from 'react-router';
import { Box } from '@mui/material';
import { Home, Login, AdminPanel } from '../../../../pages';
import { Header } from '../../../../shared/ui';
import { CreateApplicationButton } from '../../../../features/application-management';

interface AppRouterProps {
  role: string;
  onLogout: () => void;
}

export const AppRouter = ({ role, onLogout }: AppRouterProps) => {
  return (
    <BrowserRouter>
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Header role={role} onLogout={onLogout} />
        <Box sx={{ 
          flex: 1,
          pt: { xs: 1, md: 2 },
          pb: { xs: 2, md: 3 }
        }}>
          {role === "admin" ? (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Login />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          ) : (
            <CreateApplicationButton />
          )}
        </Box>
      </Box>
    </BrowserRouter>
  );
};
