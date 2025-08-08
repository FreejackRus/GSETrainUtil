import React from 'react';
import { AutocompleteField } from '../../AutocompleteField';
import './StepLocation.css';

interface StepLocationProps {
  value: string;
  onChange: (field: string, value: string) => void;
  options: string[];
}

export const StepLocation: React.FC<StepLocationProps> = ({
  value,
  onChange,
  options
}) => {
  return (
    <AutocompleteField
      label="📍 Текущее местоположение"
      value={value}
      onChange={(newValue) => onChange("location", newValue)}
      options={options}
      placeholder="Выберите или введите местоположение"
      fullWidth
      required
    />
  );
};