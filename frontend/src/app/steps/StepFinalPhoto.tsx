import { Box, Button, Avatar } from "@mui/material";

export const StepFinalPhoto = ({
  value,
  onPhotoChange,
}: {
  value: File | null;
  onPhotoChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <Box>
    <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }}>
      Загрузить общую фотографию
      <input type="file" accept="image/*" hidden onChange={onPhotoChange("finalPhoto")} />
    </Button>
    {value && (
      <Box display="flex" justifyContent="center" mt={1}>
        <Avatar
          variant="rounded"
          src={URL.createObjectURL(value)}
          alt="Общая фотография"
          sx={{ width: 120, height: 90 }}
        />
      </Box>
    )}
  </Box>
);
