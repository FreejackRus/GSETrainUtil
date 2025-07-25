import { TextField, MenuItem, Box, Typography, Avatar, Card, CardContent } from "@mui/material";
import { Build, SwapHoriz, Search, Handyman } from "@mui/icons-material";

const workTypeIcons: { [key: string]: JSX.Element } = {
  "монтаж": <Build />,
  "замена": <SwapHoriz />,
  "диагностика": <Search />,
  "ремонт": <Handyman />,
};

export const StepWorkType = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (field: string, value: any) => void;
  options: string[];
}) => (
  <Box>
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
      🔧 Выберите тип работ
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Укажите, какой вид работ будет выполняться с оборудованием
    </Typography>
    
    <TextField
      select
      label="Тип работ"
      value={value}
      onChange={(e) => onChange("workType", e.target.value)}
      fullWidth
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 3,
          '&:hover fieldset': {
            borderColor: '#667eea',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#667eea',
          }
        }
      }}
    >
      {options.map((type) => (
        <MenuItem key={type} value={type} sx={{ py: 1.5 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: value === type ? '#667eea' : '#f5f5f5',
                color: value === type ? 'white' : '#666'
              }}
            >
              {workTypeIcons[type] || <Build />}
            </Avatar>
            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
              {type}
            </Typography>
          </Box>
        </MenuItem>
      ))}
    </TextField>

    {value && (
      <Card sx={{ mt: 3, borderRadius: 3, bgcolor: '#f8f9ff' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#667eea', color: 'white' }}>
              {workTypeIcons[value] || <Build />}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Выбрано: {value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Тип работ определен
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )}
  </Box>
);
