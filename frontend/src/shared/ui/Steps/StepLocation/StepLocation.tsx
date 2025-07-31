import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import './StepLocation.css';

interface StepLocationProps {
  formData: { location: string };
  onFormDataChange: (data: Partial<{ location: string }>) => void;
  options: string[];
}

export const StepLocation: React.FC<StepLocationProps> = ({
  formData,
  onFormDataChange,
  options,
}) => {
  const value = formData.location || '';
  return (
    <Box className="step-location">
      <Typography variant="h6" className="step-location__title">
        📍 Текущее местоположение
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        Укажите депо или станцию, где выполняются работы
      </Typography>

      <FormControl fullWidth sx={{ mt: 3 }}>
        <InputLabel className="step-location__label">Депо/Станция</InputLabel>
        <Select
          value={value || ''}
          onChange={(e) => onFormDataChange({ location: e.target.value })}
          label="Депо/Станция"
          className="step-location__select"
        >
          {options.map((option, index) => (
            <MenuItem key={`${option}-${index}`} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
