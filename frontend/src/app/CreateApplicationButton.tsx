import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { CreateApplicationForm } from "./CreateApplicationForm";

export const CreateApplicationButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
    >
      <Button variant="contained" color="primary" size="large" onClick={() => setOpen(true)}>
        Создать заявку
      </Button>
      <CreateApplicationForm open={open} onClose={() => setOpen(false)} />
    </Box>
  );
};
