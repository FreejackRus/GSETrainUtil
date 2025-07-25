import { TextField, MenuItem, Box, Typography, Avatar, Card, CardContent } from "@mui/material";
import { Train, DirectionsRailway } from "@mui/icons-material";

export const StepTrainNumber = ({
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
      🚂 Номер поезда
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Выберите номер поезда из списка доступных составов
    </Typography>
    
    <Box display="flex" alignItems="center" gap={2} mb={2}>
      <Avatar sx={{ bgcolor: '#667eea', width: 48, height: 48 }}>
        <Train sx={{ fontSize: 28 }} />
      </Avatar>
      <Box flex={1}>
        <TextField
          select
          label="Номер поезда"
          value={value}
          onChange={(e) => onChange("trainNumber", e.target.value)}
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
          {options.map((num) => (
            <MenuItem key={num} value={num} sx={{ py: 1.5 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: value === num ? '#667eea' : '#f5f5f5',
                    color: value === num ? 'white' : '#666'
                  }}
                >
                  <DirectionsRailway />
                </Avatar>
                <Typography variant="body1" fontWeight="bold">
                  Поезд №{num}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Box>

    {value && (
      <Card sx={{ mt: 3, borderRadius: 3, bgcolor: '#f8f9ff' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#667eea', color: 'white' }}>
              <Train />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Поезд №{value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Состав выбран для работ
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )}
  </Box>
);
