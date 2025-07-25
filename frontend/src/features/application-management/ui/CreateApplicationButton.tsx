import React, { useState } from "react";
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper,
  Fade,
  useTheme
} from "@mui/material";
import { 
  Add as AddIcon,
  Assignment as AssignmentIcon 
} from "@mui/icons-material";
import { CreateApplicationForm } from "./CreateApplicationForm";

export const CreateApplicationButton = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  return (
    <Container maxWidth="md">
      <Fade in timeout={800}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="calc(100vh - 120px)"
          sx={{ py: 4 }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 6,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              border: `2px solid ${theme.palette.primary.light}`,
              textAlign: 'center',
              maxWidth: 500,
              width: '100%',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }
            }}
          >
            <Box sx={{ mb: 4 }}>
              <AssignmentIcon 
                sx={{ 
                  fontSize: 80, 
                  color: theme.palette.primary.main,
                  mb: 2,
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }} 
              />
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.dark,
                  mb: 2
                }}
              >
                Система заявок
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ 
                  mb: 3,
                  lineHeight: 1.6
                }}
              >
                Создайте новую заявку на техническое обслуживание оборудования
              </Typography>
            </Box>

            <Button 
              variant="contained" 
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
              sx={{
                fontSize: '1.2rem',
                py: 2,
                px: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Создать заявку
            </Button>

            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mt: 3,
                fontStyle: 'italic'
              }}
            >
              Заполните все необходимые поля для быстрой обработки заявки
            </Typography>
          </Paper>
          
          <CreateApplicationForm open={open} onClose={() => setOpen(false)} />
        </Box>
      </Fade>
    </Container>
  );
};
