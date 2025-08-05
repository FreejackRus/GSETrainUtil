import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
  ClickAwayListener,
  InputAdornment,
  Collapse
} from '@mui/material';
import { Search, TrendingUp } from '@mui/icons-material';
import './AutocompleteField.css';

interface AutocompleteFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  required?: boolean;
}

export const AutocompleteField: React.FC<AutocompleteFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  size = 'medium',
  fullWidth = false,
  required = false
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Фильтрация опций при изменении ввода
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options.slice(0, 8)); // Показываем первые 8 опций
    }
    setHighlightedIndex(-1);
  }, [inputValue, options]);

  // Синхронизация с внешним значением
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleOptionSelect = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleClickAway = () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        } else if (inputValue.trim()) {
          // Если ничего не выделено, но есть текст - используем его
          onChange(inputValue);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <strong key={index} className="autocomplete-highlight">{part}</strong>
      ) : (
        part
      )
    );
  };

  const showDropdown = isOpen && (filteredOptions.length > 0 || inputValue.trim());

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box className={`search-autocomplete ${showDropdown ? 'dropdown-open' : ''}`} ref={anchorRef}>
        <TextField
          ref={inputRef}
          fullWidth={fullWidth}
          size={size}
          label={label}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search className="search-icon" />
              </InputAdornment>
            ),
          }}
          className="search-input"
        />

        <Collapse in={showDropdown} timeout={200}>
          <Paper className="search-dropdown" elevation={3}>
            <List className="search-results">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <ListItem
                    key={index}
                    component="button"
                    selected={index === highlightedIndex}
                    onClick={() => handleOptionSelect(option)}
                    className={`search-result-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                  >
                    <TrendingUp className="suggestion-icon" />
                    <ListItemText 
                      primary={highlightMatch(option, inputValue)}
                      className="search-result-text"
                    />
                  </ListItem>
                ))
              ) : inputValue.trim() ? (
                <ListItem className="no-results">
                  <ListItemText 
                    primary={
                      <Typography variant="body2" color="text.secondary">
                        Нажмите Enter, чтобы использовать: <strong>"{inputValue}"</strong>
                      </Typography>
                    }
                  />
                </ListItem>
              ) : null}
            </List>
          </Paper>
        </Collapse>
      </Box>
    </ClickAwayListener>
  );
};