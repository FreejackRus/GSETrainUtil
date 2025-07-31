import { BrowserRouter, Route, Routes } from 'react-router';
import { Box } from '@mui/material';
import { Home, Login, AdminPanel, CarriagesPage, WorkLogPage, CreateApplicationPage, MyApplicationsPage } from '../../../../pages';
import { WorkLogDetailPage } from '../../../../pages/WorkLogDetailPage';
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
              <Route path="/auth" element={<Login onLogin={() => {}} />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/carriages" element={<CarriagesPage />} />
              <Route path="/work-log" element={<WorkLogPage />} />
              <Route path="/work-log/:id" element={<WorkLogDetailPage />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<CreateApplicationPage />} />
              <Route path="/auth" element={<Login onLogin={() => {}} />} />
              <Route path="/create-application" element={<CreateApplicationPage />} />
              <Route path="/my-applications" element={<MyApplicationsPage />} />
            </Routes>
          )}
        </Box>
      </Box>
    </BrowserRouter>
  );
};
