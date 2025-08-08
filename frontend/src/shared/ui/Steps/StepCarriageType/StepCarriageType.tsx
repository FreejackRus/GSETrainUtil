import React from 'react';
import { AutocompleteField } from '../../AutocompleteField';
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
    <AutocompleteField
      label="🚃 Тип вагона"
      value={value}
      onChange={(newValue) => onChange("carriageType", newValue)}
      options={options}
      placeholder="Выберите или введите тип вагона"
      fullWidth
      required
    />
  );
};