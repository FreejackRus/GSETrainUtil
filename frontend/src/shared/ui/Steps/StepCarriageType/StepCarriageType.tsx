import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import './StepCarriageType.css';

interface StepCarriageTypeProps {
  value: string;
  onChange: (field: string, value: string) => void;
  options: string[];
}

export const StepCarriageType: React.FC<StepCarriageTypeProps> = ({
  value,
  onChange,
  options
}) => {
  return (
    <Box className="step-carriage-type">
      <Typography variant="h6" className="step-carriage-type__title">
        🚃 Выберите тип вагона
      </Typography>
      
      <FormControl fullWidth sx={{ mt: 3 }}>
        <InputLabel className="step-carriage-type__label">Тип вагона</InputLabel>
        <Select
          value={value}
          onChange={(e) => onChange('carriageType', e.target.value)}
          label="Тип вагона"
          className="step-carriage-type__select"
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};