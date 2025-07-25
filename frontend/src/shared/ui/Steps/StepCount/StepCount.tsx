import React from 'react';
import { Box, TextField, Typography, Card, CardContent, IconButton } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import './StepCount.css';

interface StepCountProps {
  value: number;
  onChange: (field: string, value: number) => void;
  equipment: string;
}

export const StepCount: React.FC<StepCountProps> = ({
  value,
  onChange,
  equipment
}) => {
  const handleIncrement = () => {
    onChange('count', value + 1);
  };

  const handleDecrement = () => {
    if (value > 1) {
      onChange('count', value - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 1;
    if (newValue >= 1) {
      onChange('count', newValue);
    }
  };

  return (
    <Box className="step-count">
      <Typography variant="h6" className="step-count__title">
        📊 Количество оборудования
      </Typography>
      
      {equipment && (
        <Card sx={{ mt: 2, mb: 3, bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Оборудование: <strong>{equipment}</strong>
            </Typography>
          </CardContent>
        </Card>
      )}
      
      <Box display="flex" alignItems="center" gap={2} sx={{ mt: 3 }}>
        <IconButton 
          onClick={handleDecrement}
          disabled={value <= 1}
          className="step-count__button"
          sx={{ 
            bgcolor: '#f5f5f5',
            '&:hover': { bgcolor: '#e0e0e0' }
          }}
        >
          <Remove />
        </IconButton>
        
        <TextField
          type="number"
          value={value}
          onChange={handleChange}
          inputProps={{ min: 1, style: { textAlign: 'center' } }}
          className="step-count__input"
          sx={{ 
            width: 120,
            '& input': { 
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }
          }}
        />
        
        <IconButton 
          onClick={handleIncrement}
          className="step-count__button"
          sx={{ 
            bgcolor: '#f5f5f5',
            '&:hover': { bgcolor: '#e0e0e0' }
          }}
        >
          <Add />
        </IconButton>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        Укажите количество единиц оборудования
      </Typography>
    </Box>
  );
};