import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  Avatar,
  Chip,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { 
  ExitToApp as LogoutIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Create as CreateIcon,
  List as ListIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import './Header.css';

interface HeaderProps {
  role: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ role, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSmallMobile = useMediaQuery('(max-width: 480px)');
  
  // Определяем текущую вкладку для инженеров
  const getCurrentTab = () => {
    if (location.pathname === '/my-applications') return 1;
    return 0; // create-application или главная
  };
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: isMobile ? 'short' : 'long',
      year: 'numeric',
      month: isMobile ? 'short' : 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: isSmallMobile ? undefined : '2-digit'
    });
  };

  const getRoleDisplayName = (role: string) => {
    return role === 'admin' ? 'Администратор' : 'Инженер';
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    navigate("/")
    handleUserMenuClose();
    onLogout();
  };
const handleLogoutAdmin = () => {
    navigate("/")
    onLogout();
  };
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) {
      navigate('/create-application');
    } else if (newValue === 1) {
      navigate('/my-applications');
    }
  };



  return (
    <>
      <AppBar position="static" elevation={3}  className="header">
        <Toolbar className="header__toolbar">
          {/* Левая часть - Логотип и название */}
          <Box className="header__left">
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={handleMobileMenuToggle}
                className="header__menu-button"
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box className="header__logo">
              <img 
                src="/logo_peremena.png" 
                alt="PEREMENA" 
                width={isMobile ? 120 : 160} 
                height={isMobile ? 30 : 40}
              />
            </Box>
          </Box>

          {/* Центральная часть - навигация для инженеров или дата/время для админа */}
          {!isMobile && (
            <Box className="header__center">
              {role === 'engineer' ? (
                <Tabs 
                  value={getCurrentTab()} 
                  onChange={handleTabChange}
                  textColor="inherit"
                  indicatorColor="secondary"
                  sx={{
                    '& .MuiTab-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-selected': {
                        color: 'white',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'white',
                    },
                  }}
                >
                  <Tab 
                    icon={<CreateIcon />} 
                    label="Создание заявки" 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<ListIcon />} 
                    label="Мои заявки" 
                    iconPosition="start"
                  />
                </Tabs>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    color="inherit"
                    startIcon={<ArchiveIcon />}
                    onClick={() => navigate('/archive')}
                    sx={{
                      color: location.pathname === '/archive' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Архив фото
                  </Button>
                  <Box className="header__time">
                    <TimeIcon sx={{ mr: 1, fontSize: 16 }} />
                    {formatDate(currentTime)} • {formatTime(currentTime)}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Правая часть - пользователь */}
          <Box className="header__right">
            <Box className="header__desktop-nav">
              <Box className="header__user-info">
                <Avatar className="header__avatar">
                  <PersonIcon />
                </Avatar>
                <Chip 
                sx={{color:"white",bgcolor:"green"}}
                  label={getRoleDisplayName(role)}
                  size="small"
                  className={`header__role-chip header__role-chip--${role}`}
                />
              </Box>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogoutAdmin}
                sx={{ 
                  color: 'white',
                  
                  '&:hover': {
                    bgcolor:"red"
                  }
                }}
              >
                Выход
              </Button>
            </Box>
            
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={handleUserMenuOpen}
              >
                <Avatar className="header__avatar">
                  <PersonIcon />
                </Avatar>
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Мобильное меню */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        className="header__mobile-drawer"
      >
        <Box className="header__drawer-header">
          <Typography variant="h6" className="header__title">
            ГСЭ ТехноАРМ
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
        <Box className="header__drawer-content">
          <Box className="header__drawer-user">
            <Avatar className="header__avatar">
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                {getRoleDisplayName(role)}
              </Typography>
            </Box>
          </Box>
          
          {/* Навигация для инженеров в мобильном меню */}
          {role === 'engineer' && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Button
                fullWidth
                startIcon={<CreateIcon />}
                onClick={() => {
                  navigate('/create-application');
                  setMobileMenuOpen(false);
                }}
                sx={{
                  color: 'white',
                  justifyContent: 'flex-start',
                  mb: 1,
                  backgroundColor: location.pathname === '/create-application' || location.pathname === '/' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                Создание заявки
              </Button>
              <Button
                fullWidth
                startIcon={<ListIcon />}
                onClick={() => {
                  navigate('/my-applications');
                  setMobileMenuOpen(false);
                }}
                sx={{
                  color: 'white',
                  justifyContent: 'flex-start',
                  backgroundColor: location.pathname === '/my-applications' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                Мои заявки
              </Button>
            </Box>
          )}

          {/* Навигация для администраторов в мобильном меню */}
          {role === 'admin' && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Button
                fullWidth
                startIcon={<ArchiveIcon />}
                onClick={() => {
                  navigate('/archive');
                  setMobileMenuOpen(false);
                }}
                sx={{
                  color: 'white',
                  justifyContent: 'flex-start',
                  backgroundColor: location.pathname === '/archive' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                Архив фото
              </Button>
            </Box>
          )}
          
          <Typography variant="body2" className="header__drawer-time">
            {formatDate(currentTime)}
            <br />
            {formatTime(currentTime)}
          </Typography>
          <Button
            fullWidth
            startIcon={<LogoutIcon />}
            sx={{color:"#fafafa"}}
            onClick={handleLogout}
            className="header__logout-button"
          >
            Выход
          </Button>
        </Box>
      </Drawer>

      {/* Меню пользователя для мобильных */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Выход</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};