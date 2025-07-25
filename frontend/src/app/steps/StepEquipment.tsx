import { 
  Box, 
  TextField, 
  MenuItem, 
  Avatar, 
  Typography, 
  Card, 
  CardContent
} from "@mui/material";
import { 
  Computer, 
  Router, 
  Cable
} from "@mui/icons-material";
import { PhotoUpload } from "../../shared/ui";

const equipmentIcons: { [key: string]: React.ReactElement } = {
  "пром. комп.": <Computer />,
  "маршрутизатор": <Router />,
  "коммутатор": <Computer />,
  "коннектор": <Cable />,
};

export const StepEquipment = ({
  value,
  photo,
  onChange,
  onPhotoChange,
  options,
}: {
  value: string;
  photo: File | null;
  onChange: (field: string, value: any) => void;
  onPhotoChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: string[];
}) => (
  <Box>
    <TextField
      select
      label="Наименование оборудования"
      value={value}
      onChange={(e) => onChange("equipment", e.target.value)}
      fullWidth
      sx={{
        mb: 2,
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
                bgcolor: '#667eea'
              }}
            >
              {equipmentIcons[type] || <Computer />}
            </Avatar>
            <Typography>{type}</Typography>
          </Box>
        </MenuItem>
      ))}
    </TextField>

    {value && (
      <Card sx={{ mb: 2, borderRadius: 3, bgcolor: '#f8f9ff' }}>
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#667eea' }}>
              {equipmentIcons[value] || <Computer />}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Выбранное оборудование
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )}

    <PhotoUpload
      photo={photo}
      onPhotoChange={onPhotoChange("equipmentPhoto")}
      label="Фотография оборудования"
      description="Загрузите четкое фото оборудования для идентификации"
      required={true}
    />
  </Box>
);
