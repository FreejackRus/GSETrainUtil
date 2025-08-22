// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Button,
//   TextField,
//   Grid,
//   IconButton,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Chip,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Alert,
//   InputAdornment, Tooltip, Stack,
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   ExpandMore as ExpandMoreIcon,
//   PhotoCamera as PhotoCameraIcon,
//   CheckCircle as CheckCircleIcon,
//   Error as ErrorIcon,
// } from '@mui/icons-material';
// import { PhotoUpload } from '../../PhotoUpload';
// import { AutocompleteField } from '../../AutocompleteField';
// import { referenceApi } from '../../../api';
// import type {CarriageFormItem, EquipmentFormItem, TrainFormItem} from "../../../../entities/application/model/types.ts";
//
// // interface StepCarriagesProps {
// //   carriages: CarriageFormItem[];
// //   onCarriagesChange: (carriages: CarriageFormItem[]) => void;
// //   onValidationChange?: (isValid: boolean) => void;
// // }
//
// interface StepCarriagesProps {
//   trains: TrainFormItem[];
//   onTrainsChange: (trains: TrainFormItem[]) => void;
//   onValidationChange?: (isValid: boolean) => void;
// }
//
// export const StepCarriages: React.FC<StepCarriagesProps> = ({
//   // carriages,
//   // onCarriagesChange,
//   trains,
//   onTrainsChange,
//   onValidationChange,
// }) => {
//   const [carriageTypes, setCarriageTypes] = useState<string[]>([]);
//   const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
//   const [workTypes, setWorkTypes] = useState<string[]>([]);
//
//   // Загружаем справочные данные
//   // useEffect(() => {
//   //   const loadReferenceData = async () => {
//   //     try {
//   //       const [carriageTypesData, equipmentTypesData] = await Promise.all([
//   //         referenceApi.getCarriageTypes(),
//   //         referenceApi.getEquipmentTypes(),
//   //       ]);
//   //       setCarriageTypes(carriageTypesData);
//   //       setEquipmentTypes(equipmentTypesData);
//   //     } catch (error) {
//   //       console.error('Ошибка загрузки справочных данных:', error);
//   //     }
//   //   };
//   //
//   //   loadReferenceData();
//   // }, []);
//
//   // Загружаем справочные данные
//   useEffect(() => {
//     (async () => {
//       try {
//         const [carriageTypesData, equipmentTypesData, workTypesData] = await Promise.all([
//           referenceApi.getCarriageTypes(),
//           referenceApi.getEquipmentTypes(),
//           referenceApi.getWorkTypes(),
//         ]);
//         setCarriageTypes(carriageTypesData);
//         setEquipmentTypes(equipmentTypesData);
//         setWorkTypes(workTypesData);
//       } catch (e) { console.error(e); }
//     })();
//   }, []);
//
//   const addTrain = () => onTrainsChange([ ...trains, { trainNumber: "", carriages: [] } ]);
//   const removeTrain = (ti: number) => onTrainsChange(trains.filter((_, i) => i !== ti));
//   const changeTrain = (ti: number, patch: Partial<TrainFormItem>) => {
//     const next = trains.map((t, i) => i === ti ? { ...t, ...patch } : t);
//     onTrainsChange(next);
//   };
//
//   // Валидация формы
//   // const validateForm = () => {
//   //   if (carriages.length === 0) return false;
//   //
//   //   return carriages.every((carriage) => {
//   //     // Проверяем заполненность полей вагона и фото вагона
//   //     const carriageValid =
//   //       carriage.carriageNumber.trim() !== '' &&
//   //       carriage.carriageType.trim() !== '' &&
//   //       carriage.carriagePhoto !== null;
//   //
//   //     // Проверяем заполненность оборудования
//   //     const equipmentValid =
//   //       !carriage.equipment ||
//   //       carriage.equipment.length === 0 ||
//   //       carriage.equipment.every(
//   //         (equipment: EquipmentFormItem) =>
//   //           equipment.equipmentType.trim() !== '' &&
//   //           equipment.serialNumber.trim() !== '' &&
//   //           equipment.quantity > 0 &&
//   //           equipment.photos.equipment !== null &&
//   //           equipment.photos.serial !== null &&
//   //           // MAC-адрес и фото MAC обязательны только для определенных типов оборудования
//   //           (isNetworkEquipment(equipment.equipmentType)
//   //             ? equipment.macAddress.trim() !== '' &&
//   //               isValidMacAddress(equipment.macAddress) &&
//   //               equipment.photos.mac !== null
//   //             : true),
//   //       );
//   //
//   //     return carriageValid && equipmentValid;
//   //   });
//   // };
//
//   const validateForm = () => {
//     if (trains.length === 0) return false;
//
//     return trains.every(t =>
//         t.trainNumber.trim() !== "" &&
//         t.carriages.length > 0 &&
//         t.carriages.every(c => {
//           const carriageOk =
//               c.carriageNumber.trim() !== "" &&
//               c.carriageType.trim()   !== "" &&
//               c.carriagePhotos?.carriage &&
//               c.carriagePhotos?.equipment;
//
//           const equipOk =
//               (c.equipment?.length ?? 0) > 0 &&
//               c.equipment!.every(e => {
//                 const baseOk =
//                     e.equipmentType.trim() !== "" &&
//                     e.typeWork.trim()      !== "" &&
//                     e.serialNumber.trim()  !== "" &&
//                     e.photos.equipment &&
//                     e.photos.serial;
//
//                 const needMac = isNetworkEquipment(e.equipmentType);
//                 const macOk = !needMac || (
//                     e.macAddress.trim() !== "" && isValidMacAddress(e.macAddress) && e.photos.mac
//                 );
//                 return baseOk && macOk;
//               });
//
//           return carriageOk && equipOk;
//         })
//     );
//   };
//
//
//   // Проверяем, является ли оборудование сетевым (требует MAC-адрес)
//   const isNetworkEquipment = (equipmentType: string): boolean => {
//     const networkTypes = ['точка доступа', 'маршрутизатор', 'коммутатор'];
//     return networkTypes.some((type) => equipmentType.toLowerCase().includes(type));
//   };
//
//   // Форматирование MAC-адреса
//   const formatMacAddress = (value: string): string => {
//     // Удаляем все символы кроме букв и цифр
//     const cleaned = value.replace(/[^a-fA-F0-9]/g, '');
//
//     // Ограничиваем до 12 символов
//     const limited = cleaned.slice(0, 12);
//
//     // Добавляем двоеточия каждые 2 символа
//     const formatted = limited.replace(/(.{2})/g, '$1:').slice(0, -1);
//
//     return formatted.toUpperCase();
//   };
//
//   // Валидация MAC-адреса
//   const isValidMacAddress = (mac: string): boolean => {
//     const macRegex = /^([0-9A-F]{2}[:]){5}([0-9A-F]{2})$/;
//     return macRegex.test(mac);
//   };
//
//   // Уведомляем о валидации при изменении данных
//   useEffect(() => {
//     const isValid = validateForm();
//     onValidationChange?.(isValid);
//   }, [carriages, onValidationChange]);
//
//   // Функции для работы с вагонами
//   const handleAddCarriage = () => {
//     const newCarriage: CarriageFormItem = {
//       id: Date.now().toString(),
//       carriageNumber: '',
//       carriageType: '',
//       carriagePhoto: null,
//       equipment: [],
//     };
//     onCarriagesChange([...carriages, newCarriage]);
//   };
//
//   const handleRemoveCarriage = (index: number) => {
//     const newCarriages = carriages.filter((_, i) => i !== index);
//     onCarriagesChange(newCarriages);
//   };
//
//   const handleCarriageChange = (index: number, field: keyof CarriageFormItem, value: any) => {
//     const newCarriages = [...carriages];
//     newCarriages[index] = { ...newCarriages[index], [field]: value };
//     onCarriagesChange(newCarriages);
//   };
//
//   // Функции для работы с оборудованием
//   const handleAddEquipment = (carriageIndex: number) => {
//     const newEquipment: EquipmentFormItem = {
//       equipmentType: '',
//       serialNumber: '',
//       macAddress: '',
//       quantity: 1,
//       carriageId: carriages[carriageIndex].id,
//       photos: {
//         equipment: null,
//         serial: null,
//         mac: null,
//       },
//     };
//
//     const newCarriages = [...carriages];
//     if (!newCarriages[carriageIndex].equipment) {
//       newCarriages[carriageIndex].equipment = [];
//     }
//     newCarriages[carriageIndex].equipment!.push(newEquipment);
//     onCarriagesChange(newCarriages);
//   };
//
//   const handleRemoveEquipment = (carriageIndex: number, equipmentIndex: number) => {
//     const newCarriages = [...carriages];
//     newCarriages[carriageIndex].equipment =
//       newCarriages[carriageIndex].equipment?.filter(
//         (_item: EquipmentFormItem, i: number) => i !== equipmentIndex,
//       ) || [];
//     onCarriagesChange(newCarriages);
//   };
//
//   const handleEquipmentChange = (
//     carriageIndex: number,
//     equipmentIndex: number,
//     field: keyof EquipmentFormItem,
//     value: any,
//   ) => {
//     const newCarriages = [...carriages];
//     if (newCarriages[carriageIndex].equipment) {
//       if (field === 'macAddress' && typeof value === 'string') {
//         // Форматируем MAC-адрес при вводе
//         value = formatMacAddress(value);
//       }
//       newCarriages[carriageIndex].equipment![equipmentIndex] = {
//         ...newCarriages[carriageIndex].equipment![equipmentIndex],
//         [field]: value,
//       };
//       onCarriagesChange(newCarriages);
//     }
//   };
//
//   const handleEquipmentPhotoChange = (
//     carriageIndex: number,
//     equipmentIndex: number,
//     photoType: 'equipment' | 'serial' | 'mac',
//     file: File | null,
//   ) => {
//     const newCarriages = [...carriages];
//     if (newCarriages[carriageIndex].equipment) {
//       newCarriages[carriageIndex].equipment![equipmentIndex].photos[photoType] = file;
//       onCarriagesChange(newCarriages);
//     }
//   };
//
//   // Проверка заполненности вагона
//   const isCarriageComplete = (carriage: CarriageFormItem): boolean => {
//     const carriageFieldsComplete =
//       carriage.carriageNumber.trim() !== '' &&
//       carriage.carriageType.trim() !== '' &&
//       carriage.carriagePhoto !== null;
//
//     const equipmentComplete =
//       !carriage.equipment ||
//       carriage.equipment.length === 0 ||
//       carriage.equipment.every(
//         (equipment: EquipmentFormItem) =>
//           equipment.equipmentType.trim() !== '' &&
//           equipment.serialNumber.trim() !== '' &&
//           equipment.quantity > 0 &&
//           equipment.photos.equipment !== null &&
//           equipment.photos.serial !== null &&
//           (isNetworkEquipment(equipment.equipmentType)
//             ? equipment.macAddress.trim() !== '' &&
//               isValidMacAddress(equipment.macAddress) &&
//               equipment.photos.mac !== null
//             : true),
//       );
//     return carriageFieldsComplete && equipmentComplete;
//   };
//
//   // Получение ошибок для оборудования
//   const getEquipmentErrors = (equipment: EquipmentFormItem): string[] => {
//     const errors: string[] = [];
//
//     if (!equipment.equipmentType.trim()) errors.push('Не указан тип оборудования');
//     if (!equipment.serialNumber.trim()) errors.push('Не указан серийный номер');
//     if (equipment.quantity <= 0) errors.push('Количество должно быть больше 0');
//
//     if (isNetworkEquipment(equipment.equipmentType)) {
//       if (!equipment.macAddress.trim()) {
//         errors.push('MAC-адрес обязателен для сетевого оборудования');
//       } else if (!isValidMacAddress(equipment.macAddress)) {
//         errors.push('Неверный формат MAC-адреса');
//       }
//     }
//
//     return errors;
//   };
//
//   return (
//     <Box>
//       <Typography variant="h6" gutterBottom>
//         Вагоны и оборудование
//       </Typography>
//
//       {carriages.length === 0 && (
//         <Alert severity="info" sx={{ mb: 2 }}>
//           Добавьте хотя бы один вагон для продолжения
//         </Alert>
//       )}
//
//       {carriages.map((carriage, carriageIndex) => (
//         <Card key={carriage.id || carriageIndex} sx={{ mb: 2 }}>
//           <CardContent>
//             <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//               <Box display="flex" alignItems="center" gap={1}>
//                 <Typography variant="h6">Вагон {carriageIndex + 1}</Typography>
//                 {isCarriageComplete(carriage) ? (
//                   <CheckCircleIcon color="success" />
//                 ) : (
//                   <ErrorIcon color="error" />
//                 )}
//               </Box>
//               <IconButton
//                 onClick={() => handleRemoveCarriage(carriageIndex)}
//                 color="error"
//                 size="small"
//               >
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//
//             <Grid container spacing={2} mb={2}>
//               <Grid size={{ xs: 12, md: 6 }}>
//                 <TextField
//                   fullWidth
//                   label="Номер вагона"
//                   value={carriage.carriageNumber}
//                   onChange={(e) =>
//                     handleCarriageChange(carriageIndex, 'carriageNumber', e.target.value)
//                   }
//                   error={!carriage.carriageNumber.trim()}
//                   helperText={!carriage.carriageNumber.trim() ? 'Обязательное поле' : ''}
//                   required
//                 />
//               </Grid>
//               <Grid size={{ xs: 12, md: 6 }}>
//                 <AutocompleteField
//                   label="Тип вагона"
//                   value={carriage.carriageType}
//                   onChange={(value) => handleCarriageChange(carriageIndex, 'carriageType', value)}
//                   options={carriageTypes}
//                   error={!carriage.carriageType.trim()}
//                   helperText={!carriage.carriageType.trim() ? 'Обязательное поле' : ''}
//                   required
//                 />
//               </Grid>
//             </Grid>
//
//             {/* Фотография вагона */}
//             {carriage.carriageNumber && carriage.carriageType && (
//               <Box mb={2}>
//                 <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                   📷 Фотография вагона
//                 </Typography>
//                 {/*<PhotoUpload*/}
//                 {/*  label="Фото вагона"*/}
//                 {/*  inputId={carriage.carriageNumber}*/}
//                 {/*  photo={carriage.carriagePhoto || null}*/}
//                 {/*  onPhotoChange={(file) =>*/}
//                 {/*    handleCarriageChange(carriageIndex, 'carriagePhoto', file)*/}
//                 {/*  }*/}
//                 {/*  required*/}
//                 {/*/>*/}
//                 <PhotoUpload
//                     inputId={`t${ti}-c${ci}-carriage`}
//                     label="Фото номера вагона"
//                     photo={carriage.carriagePhotos?.carriage ?? null}
//                     onPhotoChange={(file) => changeCarriage(ti, ci, {
//                       carriagePhotos: { ...(carriage.carriagePhotos ?? { carriage: null, equipment: null }), carriage: file }
//                     })}
//                     required
//                 />
//                 <PhotoUpload
//                     inputId={`t${ti}-c${ci}-equip-overview`}
//                     label="Общее фото оборудования в вагоне"
//                     photo={carriage.carriagePhotos?.equipment ?? null}
//                     onPhotoChange={(file) => changeCarriage(ti, ci, {
//                       carriagePhotos: { ...(carriage.carriagePhotos ?? { carriage: null, equipment: null }), equipment: file }
//                     })}
//                     required
//                 />
//
//               </Box>
//             )}
//
//             {/* Секция оборудования */}
//             {carriage.carriageNumber && carriage.carriageType && (
//               <Box>
//                 <Box
//                   display="flex"
//                   flexWrap={'wrap'}
//                   justifyContent="space-between"
//                   alignItems="center"
//                   mb={2}
//                 >
//                   <Typography variant="subtitle1">Оборудование</Typography>
//                   <Button
//                     startIcon={<AddIcon />}
//                     onClick={() => handleAddEquipment(carriageIndex)}
//                     variant="outlined"
//                     size="small"
//                   >
//                     Добавить оборудование
//                   </Button>
//                 </Box>
//
//                 {carriage.equipment?.map((equipment: EquipmentFormItem, equipmentIndex: number) => {
//                   const equipmentErrors = getEquipmentErrors(equipment);
//                   const hasErrors = equipmentErrors.length > 0;
//
//                   return (
//                     <Accordion key={equipmentIndex} sx={{ mb: 1 }}>
//                       <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                         <Box
//                           display="flex"
//                           flexWrap={'wrap'}
//                           alignItems="center"
//                           gap={1}
//                           width="100%"
//                         >
//                           <Typography fontSize={{ xs: '0.68rem', sm: '1rem' }}>
//                             Оборудование {equipmentIndex + 1}
//                           </Typography>
//                           {hasErrors ? (
//                             <ErrorIcon color="error" fontSize="small" />
//                           ) : (
//                             <CheckCircleIcon color="success" fontSize="small" />
//                           )}
//                           {equipment.equipmentType && (
//                             <Chip label={equipment.equipmentType} size="small" variant="outlined" />
//                           )}
//                         </Box>
//                       </AccordionSummary>
//                       <AccordionDetails sx={{ p: { xs: 0, sm: 2 } }}>
//                         {hasErrors && (
//                           <Alert
//                             severity="error"
//                             sx={{ mb: 2, fontSize: { xs: '0.56rem', sm: '0.8rem' } }}
//                           >
//                             <ul style={{ margin: 0, paddingLeft: '10px' }}>
//                               {equipmentErrors.map((error, index) => (
//                                 <li key={index}>{error}</li>
//                               ))}
//                             </ul>
//                           </Alert>
//                         )}
//
//
//                         <Grid container spacing={2} mb={2}>
//                           <Grid size={{ xs: 12, md: 6 }}>
//                             <AutocompleteField
//                               label="Наименование оборудования"
//                               value={equipment.equipmentType}
//                               onChange={(value) =>
//                                 handleEquipmentChange(
//                                   carriageIndex,
//                                   equipmentIndex,
//                                   'equipmentType',
//                                   value,
//                                 )
//                               }
//                               options={Array(...new Set(equipmentTypes))}
//                               error={!equipment.equipmentType.trim()}
//                               helperText={
//                                 !equipment.equipmentType.trim() ? 'Обязательное поле' : ''
//                               }
//                               required
//                             />
//                           </Grid>
//                           <Grid size={{ xs: 12, md: 6 }}>
//                             <TextField
//                               fullWidth
//                               label="Серийный номер"
//                               value={equipment.serialNumber}
//                               onChange={(e) =>
//                                 handleEquipmentChange(
//                                   carriageIndex,
//                                   equipmentIndex,
//                                   'serialNumber',
//                                   e.target.value,
//                                 )
//                               }
//                               error={!equipment.serialNumber.trim()}
//                               helperText={!equipment.serialNumber.trim() ? 'Обязательное поле' : ''}
//                               required
//                             />
//                           </Grid>
//
//                           {isNetworkEquipment(equipment.equipmentType) && (
//                             <Grid size={{ xs: 12, md: 6 }}>
//                               <TextField
//                                 fullWidth
//                                 label="MAC-адрес"
//                                 value={equipment.macAddress}
//                                 onChange={(e) =>
//                                   handleEquipmentChange(
//                                     carriageIndex,
//                                     equipmentIndex,
//                                     'macAddress',
//                                     e.target.value,
//                                   )
//                                 }
//                                 placeholder="XX:XX:XX:XX:XX:XX"
//                                 error={
//                                   equipment.macAddress.trim() !== '' &&
//                                   !isValidMacAddress(equipment.macAddress)
//                                 }
//                                 helperText={
//                                   equipment.macAddress.trim() === ''
//                                     ? 'Обязательное поле для сетевого оборудования'
//                                     : !isValidMacAddress(equipment.macAddress)
//                                     ? 'Неверный формат MAC-адреса (XX:XX:XX:XX:XX:XX)'
//                                     : 'Формат: XX:XX:XX:XX:XX:XX'
//                                 }
//                                 InputProps={{
//                                   endAdornment: (
//                                     <InputAdornment position="end">
//                                       {equipment.macAddress &&
//                                         isValidMacAddress(equipment.macAddress) && (
//                                           <CheckCircleIcon color="success" fontSize="small" />
//                                         )}
//                                     </InputAdornment>
//                                   ),
//                                 }}
//                                 required
//                               />
//                             </Grid>
//                           )}
//                         </Grid>
//
//                         {/* Фотографии оборудования */}
//                         {equipment.equipmentType && (
//                           <Box>
//                             <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                               📷 Фотографии оборудования
//                             </Typography>
//                             <Grid container spacing={2}>
//                               <Grid size={{ xs: 12, md: 4 }}>
//                                 <PhotoUpload
//                                   label="Фото оборудования"
//                                   inputId={[equipment.equipmentType, equipment.serialNumber].join('-')}
//                                   photo={equipment.photos.equipment ?? null}
//                                   onPhotoChange={(file) =>
//                                     handleEquipmentPhotoChange(
//                                       carriageIndex,
//                                       equipmentIndex,
//                                       'equipment',
//                                       file,
//                                     )
//                                   }
//                                   required
//                                 />
//                               </Grid>
//                               <Grid size={{ xs: 12, md: 4 }}>
//                                 <PhotoUpload
//                                   label="Фото серийного номера"
//                                   inputId={equipment.serialNumber}
//                                   photo={equipment.photos.serial ?? null}
//                                   onPhotoChange={(file) =>
//                                     handleEquipmentPhotoChange(
//                                       carriageIndex,
//                                       equipmentIndex,
//                                       'serial',
//                                       file,
//                                     )
//                                   }
//                                   required
//                                 />
//                               </Grid>
//                               {isNetworkEquipment(equipment.equipmentType) && (
//                                 <Grid size={{ xs: 12, md: 4 }}>
//                                   <PhotoUpload
//                                     label="Фото MAC-адреса"
//                                     inputId={equipment.macAddress}
//                                     photo={equipment.photos.mac ?? null}
//                                     onPhotoChange={(file) =>
//                                       handleEquipmentPhotoChange(
//                                         carriageIndex,
//                                         equipmentIndex,
//                                         'mac',
//                                         file,
//                                       )
//                                     }
//                                     required
//                                   />
//                                 </Grid>
//                               )}
//                             </Grid>
//                           </Box>
//                         )}
//
//                         <Stack
//                             direction={{ xs: 'column', sm: 'row' }}
//                             spacing={1}
//                             justifyContent={{ sm: 'space-between' }}
//                             alignItems={{ xs: 'stretch', sm: 'center' }}
//                             mt={2}
//                         >
//                           <Button
//                               startIcon={<DeleteIcon />}
//                               onClick={() => handleRemoveEquipment(carriageIndex, equipmentIndex)}
//                               color="error"
//                               size="small"
//                               sx={{ width: { xs: '100%', sm: 'auto' } }}
//                           >
//                             Удалить оборудование
//                           </Button>
//
//                           <Button
//                               startIcon={<AddIcon />}
//                               onClick={() => handleAddEquipment(carriageIndex)}
//                               variant="text"
//                               size="small"
//                               sx={{ width: { xs: '100%', sm: 'auto' } }}
//                           >
//                             Добавить ещё
//                           </Button>
//                         </Stack>
//                       </AccordionDetails>
//                     </Accordion>
//                   );
//                 })}
//
//                 <Box
//                     sx={{
//                       mt: 1.5,
//                       pt: 1,
//                       borderTop: '1px dashed',
//                       borderColor: 'divider',
//                     }}
//                 >
//                   <Button
//                       startIcon={<AddIcon />}
//                       onClick={() => handleAddEquipment(carriageIndex)}
//                       variant="contained"
//                       fullWidth
//                       size="medium"
//                   >
//                     Добавить оборудование
//                   </Button>
//                 </Box>
//               </Box>
//             )}
//           </CardContent>
//         </Card>
//       ))}
//
//       <Button
//         startIcon={<AddIcon />}
//         onClick={handleAddCarriage}
//         variant="contained"
//         fullWidth
//         sx={{ mt: 2 }}
//       >
//         Добавить вагон
//       </Button>
//     </Box>
//   );
// };

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  InputAdornment,
  Stack,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { PhotoUpload } from '../../PhotoUpload';
import { AutocompleteField } from '../../AutocompleteField';
import { referenceApi } from '../../../api';
import type { CarriageFormItem, EquipmentFormItem, TrainFormItem } from '../../../../entities';

interface StepCarriagesProps {
  trains: TrainFormItem[];
  onTrainsChange: (trains: TrainFormItem[]) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const StepCarriages: React.FC<StepCarriagesProps> = ({
  trains,
  onTrainsChange,
  onValidationChange,
}) => {
  const [trainNumbers, setTrainNumbers] = useState<string[]>([]);
  const [carriageTypes, setCarriageTypes] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [workTypes, setWorkTypes] = useState<string[]>([]);

  // ---------- справочники ----------
  useEffect(() => {
    (async () => {
      try {
        const [carriageTypesData, equipmentTypesData, workTypesData, trainNumbersData] =
          await Promise.all([
            referenceApi.getCarriageTypes(),
            referenceApi.getEquipmentTypes(),
            referenceApi.getWorkTypes(),
            referenceApi.getTrainNumbers(),
          ]);

        setCarriageTypes(carriageTypesData);
        setEquipmentTypes(equipmentTypesData);
        setWorkTypes(workTypesData);
        setTrainNumbers(trainNumbersData);
      } catch (e) {
        console.error('Ошибка загрузки справочников:', e);
      }
    })();
  }, []);

  // ---------- утилиты ----------
  const isNetworkEquipment = (equipmentType: string): boolean => {
    // const networkTypes = ['точка доступа', 'маршрутизатор', 'коммутатор'];
    // return networkTypes.some((type) => equipmentType.toLowerCase().includes(type));
    return false;
  };

  const formatMacAddress = (value: string): string => {
    const cleaned = value.replace(/[^a-fA-F0-9]/g, '').slice(0, 12);
    const formatted = cleaned.replace(/(.{2})/g, '$1:').slice(0, -1);
    return formatted.toUpperCase();
  };

  const isValidMacAddress = (mac: string): boolean => {
    const macRegex = /^([0-9A-F]{2}[:]){5}([0-9A-F]{2})$/;
    return macRegex.test(mac);
  };

  // ---------- валидация ----------
  const validateForm = () => {
    if (trains.length === 0) return false;

    return trains.every(
      (t) =>
        t.trainNumber.trim() !== '' &&
        (t.carriages?.length ?? 0) > 0 &&
        t.carriages.every((c) => {
          const carriageOk =
            c.carriageNumber.trim() !== '' &&
            c.carriageType.trim() !== '' &&
            Boolean(c.carriagePhotos?.carriage) &&
            Boolean(c.carriagePhotos?.equipment);

          const equipOk =
            (c.equipment?.length ?? 0) > 0 &&
            c.equipment!.every((e) => {
              const baseOk =
                e.equipmentType.trim() !== '' &&
                e.typeWork.trim() !== '' &&
                e.serialNumber.trim() !== '' &&
                Boolean(e.photos.equipment) &&
                Boolean(e.photos.serial);

              const needMac = isNetworkEquipment(e.equipmentType);
              const macOk =
                !needMac ||
                (e.macAddress.trim() !== '' &&
                  isValidMacAddress(e.macAddress) &&
                  Boolean(e.photos.mac));

              return baseOk && macOk;
            });

          return carriageOk && equipOk;
        }),
    );
  };

  useEffect(() => {
    onValidationChange?.(validateForm());
  }, [trains, onValidationChange]);

  // ---------- действия уровня поездов ----------
  const addTrain = () => onTrainsChange([...trains, { trainNumber: '', carriages: [] }]);

  const removeTrain = (ti: number) => onTrainsChange(trains.filter((_, i) => i !== ti));

  const changeTrain = (ti: number, patch: Partial<TrainFormItem>) => {
    const next = trains.map((t, i) => (i === ti ? { ...t, ...patch } : t));
    onTrainsChange(next);
  };

  // ---------- действия уровня вагонов ----------
  const addCarriage = (ti: number) => {
    const newCarriage: CarriageFormItem = {
      id: String(Date.now()),
      carriageNumber: '',
      carriageType: '',
      carriagePhotos: { carriage: null, equipment: null },
      equipment: [],
    };
    const next = trains.map((t, i) =>
      i === ti ? { ...t, carriages: [...(t.carriages || []), newCarriage] } : t,
    );
    onTrainsChange(next);
  };

  const removeCarriage = (ti: number, ci: number) => {
    const next = trains.map((t, i) =>
      i !== ti
        ? t
        : {
            ...t,
            carriages: (t.carriages || []).filter((_, idx) => idx !== ci),
          },
    );
    onTrainsChange(next);
  };

  const changeCarriage = (ti: number, ci: number, patch: Partial<CarriageFormItem>) => {
    const next = trains.map((t, i) => {
      if (i !== ti) return t;
      const cars = (t.carriages || []).map((c, j) => (j === ci ? { ...c, ...patch } : c));
      return { ...t, carriages: cars };
    });
    onTrainsChange(next);
  };

  // ---------- действия уровня оборудования ----------
  const addEquipment = (ti: number, ci: number) => {
    const newEq: EquipmentFormItem = {
      equipmentType: '',
      typeWork: '',
      serialNumber: '',
      macAddress: '',
      quantity: 1,
      carriageId: trains[ti].carriages?.[ci]?.id ?? undefined,
      photos: { equipment: null, serial: null, mac: null },
    };

    const next = trains.map((t, i) => {
      if (i !== ti) return t;
      const cars = (t.carriages || []).map((c, j) => {
        if (j !== ci) return c;
        const eq = [...(c.equipment || []), newEq];
        return { ...c, equipment: eq };
      });
      return { ...t, carriages: cars };
    });

    onTrainsChange(next);
  };

  const removeEquipment = (ti: number, ci: number, ei: number) => {
    const next = trains.map((t, i) => {
      if (i !== ti) return t;
      const cars = (t.carriages || []).map((c, j) => {
        if (j !== ci) return c;
        const eq = (c.equipment || []).filter((_, k) => k !== ei);
        return { ...c, equipment: eq };
      });
      return { ...t, carriages: cars };
    });
    onTrainsChange(next);
  };

  const changeEquipment = (
    ti: number,
    ci: number,
    ei: number,
    field: keyof EquipmentFormItem,
    value: any,
  ) => {
    const next = trains.map((t, i) => {
      if (i !== ti) return t;
      const cars = (t.carriages || []).map((c, j) => {
        if (j !== ci) return c;
        const eq = (c.equipment || []).map((e, k) => {
          if (k !== ei) return e;
          const v =
            field === 'macAddress' && typeof value === 'string' ? formatMacAddress(value) : value;
          return { ...e, [field]: v };
        });
        return { ...c, equipment: eq };
      });
      return { ...t, carriages: cars };
    });
    onTrainsChange(next);
  };

  const changeEquipmentPhoto = (
    ti: number,
    ci: number,
    ei: number,
    photoType: 'equipment' | 'serial' | 'mac',
    file: File | null,
  ) => {
    const next = trains.map((t, i) => {
      if (i !== ti) return t;
      const cars = (t.carriages || []).map((c, j) => {
        if (j !== ci) return c;
        const eq = (c.equipment || []).map((e, k) => {
          if (k !== ei) return e;
          return { ...e, photos: { ...e.photos, [photoType]: file } };
        });
        return { ...c, equipment: eq };
      });
      return { ...t, carriages: cars };
    });
    onTrainsChange(next);
  };

  // ---------- ошибки для карточки оборудования ----------
  const getEquipmentErrors = (e: EquipmentFormItem): string[] => {
    const errors: string[] = [];
    if (!e.equipmentType.trim()) errors.push('Не указан тип оборудования');
    if (!e.typeWork.trim()) errors.push('Не указан тип работ');
    if (!e.serialNumber.trim()) errors.push('Не указан серийный номер');
    if (e.quantity <= 0) errors.push('Количество должно быть больше 0');

    if (isNetworkEquipment(e.equipmentType)) {
      if (!e.macAddress.trim()) errors.push('MAC-адрес обязателен для сетевого оборудования');
      else if (!isValidMacAddress(e.macAddress)) errors.push('Неверный формат MAC-адреса');
    }
    return errors;
  };

  // ---------- рендер ----------
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Поезда, вагоны и оборудование
      </Typography>

      {trains.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Добавьте хотя бы один поезд, затем вагоны и оборудование.
        </Alert>
      )}

      {trains.map((t, ti) => (
        <Card key={`train-${ti}`} sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                <Typography variant="h6">Поезд {ti + 1}</Typography>
                {t.trainNumber && <Chip label={`№ ${t.trainNumber}`} size="small" />}
              </Box>

              <IconButton color="error" onClick={() => removeTrain(ti)} size="small">
                <DeleteIcon />
              </IconButton>
            </Box>

            <Grid container spacing={2} mb={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <AutocompleteField
                  label="Номер поезда"
                  value={t.trainNumber}
                  onChange={(val) => changeTrain(ti, { trainNumber: val })}
                  options={trainNumbers}
                  required
                />
              </Grid>
            </Grid>

            {/* ВАГОНЫ */}
            {(t.carriages || []).map((carriage, ci) => (
              <Card key={carriage.id || `car-${ti}-${ci}`} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Typography variant="subtitle1">Вагон {ci + 1}</Typography>
                      {carriage.carriageNumber && (
                        <Chip label={`№ ${carriage.carriageNumber}`} size="small" />
                      )}
                      {carriage.carriageType && (
                        <Chip label={carriage.carriageType} size="small" variant="outlined" />
                      )}
                    </Box>
                    <IconButton onClick={() => removeCarriage(ti, ci)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2} mb={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Номер вагона"
                        value={carriage.carriageNumber}
                        onChange={(e) => changeCarriage(ti, ci, { carriageNumber: e.target.value })}
                        error={!carriage.carriageNumber.trim()}
                        helperText={!carriage.carriageNumber.trim() ? 'Обязательное поле' : ''}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <AutocompleteField
                        label="Тип вагона"
                        value={carriage.carriageType}
                        onChange={(val) => changeCarriage(ti, ci, { carriageType: val })}
                        options={carriageTypes}
                        error={!carriage.carriageType.trim()}
                        helperText={!carriage.carriageType.trim() ? 'Обязательное поле' : ''}
                        required
                      />
                    </Grid>
                  </Grid>

                  {/* Две фотографии вагона */}
                  {carriage.carriageNumber && carriage.carriageType && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        📷 Фотографии вагона
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <PhotoUpload
                            inputId={`t${ti}-c${ci}-carriage`}
                            label="Фото номера вагона"
                            photo={carriage.carriagePhotos?.carriage ?? null}
                            onPhotoChange={(file) =>
                              changeCarriage(ti, ci, {
                                carriagePhotos: {
                                  ...(carriage.carriagePhotos ?? {
                                    carriage: null,
                                    equipment: null,
                                  }),
                                  carriage: file,
                                },
                              })
                            }
                            required
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <PhotoUpload
                            inputId={`t${ti}-c${ci}-equip-overview`}
                            label="Общее фото оборудования в вагоне"
                            photo={carriage.carriagePhotos?.equipment ?? null}
                            onPhotoChange={(file) =>
                              changeCarriage(ti, ci, {
                                carriagePhotos: {
                                  ...(carriage.carriagePhotos ?? {
                                    carriage: null,
                                    equipment: null,
                                  }),
                                  equipment: file,
                                },
                              })
                            }
                            required
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* ОБОРУДОВАНИЕ */}
                  {carriage.carriageNumber && carriage.carriageType && (
                    <Box>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        mb={2}
                      >
                        <Typography variant="subtitle1">Оборудование</Typography>
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => addEquipment(ti, ci)}
                          variant="outlined"
                          size="small"
                        >
                          Добавить оборудование
                        </Button>
                      </Box>

                      {(carriage.equipment || []).map((equipment, ei) => {
                        const equipmentErrors = getEquipmentErrors(equipment);
                        const hasErrors = equipmentErrors.length > 0;

                        return (
                          <Accordion key={`eq-${ti}-${ci}-${ei}`} sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                flexWrap="wrap"
                                width="100%"
                              >
                                <Typography fontSize={{ xs: '0.9rem', sm: '1rem' }}>
                                  Оборудование {ei + 1}
                                </Typography>
                                {hasErrors ? (
                                  <ErrorIcon color="error" fontSize="small" />
                                ) : (
                                  <CheckCircleIcon color="success" fontSize="small" />
                                )}
                                {equipment.equipmentType && (
                                  <Chip
                                    label={equipment.equipmentType}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                                {equipment.typeWork && (
                                  <Chip label={equipment.typeWork} size="small" />
                                )}
                              </Box>
                            </AccordionSummary>

                            <AccordionDetails sx={{ p: { xs: 0.5, sm: 2 } }}>
                              {hasErrors && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                                    {equipmentErrors.map((err, idx) => (
                                      <li key={idx}>{err}</li>
                                    ))}
                                  </ul>
                                </Alert>
                              )}

                              <Grid container spacing={2} mb={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <AutocompleteField
                                    label="Наименование оборудования"
                                    value={equipment.equipmentType}
                                    onChange={(val) =>
                                      changeEquipment(ti, ci, ei, 'equipmentType', val)
                                    }
                                    options={Array.from(new Set(equipmentTypes))}
                                    error={!equipment.equipmentType.trim()}
                                    helperText={
                                      !equipment.equipmentType.trim() ? 'Обязательное поле' : ''
                                    }
                                    required
                                  />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                  <AutocompleteField
                                    label="Тип работ"
                                    value={equipment.typeWork}
                                    onChange={(val) => changeEquipment(ti, ci, ei, 'typeWork', val)}
                                    options={workTypes}
                                    error={!equipment.typeWork.trim()}
                                    helperText={
                                      !equipment.typeWork.trim() ? 'Обязательное поле' : ''
                                    }
                                    required
                                  />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                  <TextField
                                    fullWidth
                                    label="Серийный номер"
                                    value={equipment.serialNumber}
                                    onChange={(e) =>
                                      changeEquipment(ti, ci, ei, 'serialNumber', e.target.value)
                                    }
                                    error={!equipment.serialNumber.trim()}
                                    helperText={
                                      !equipment.serialNumber.trim() ? 'Обязательное поле' : ''
                                    }
                                    required
                                  />
                                </Grid>

                                {isNetworkEquipment(equipment.equipmentType) && (
                                  <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                      fullWidth
                                      label="MAC-адрес"
                                      value={equipment.macAddress}
                                      onChange={(e) =>
                                        changeEquipment(ti, ci, ei, 'macAddress', e.target.value)
                                      }
                                      placeholder="XX:XX:XX:XX:XX:XX"
                                      error={
                                        equipment.macAddress.trim() !== '' &&
                                        !isValidMacAddress(equipment.macAddress)
                                      }
                                      helperText={
                                        equipment.macAddress.trim() === ''
                                          ? 'Обязательное поле для сетевого оборудования'
                                          : !isValidMacAddress(equipment.macAddress)
                                          ? 'Неверный формат MAC-адреса (XX:XX:XX:XX:XX:XX)'
                                          : 'Формат: XX:XX:XX:XX:XX:XX'
                                      }
                                      InputProps={{
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            {equipment.macAddress &&
                                              isValidMacAddress(equipment.macAddress) && (
                                                <CheckCircleIcon color="success" fontSize="small" />
                                              )}
                                          </InputAdornment>
                                        ),
                                      }}
                                      required
                                    />
                                  </Grid>
                                )}
                              </Grid>

                              {/* Фотографии оборудования */}
                              {equipment.equipmentType && (
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    📷 Фотографии оборудования
                                  </Typography>
                                  <Grid container spacing={2}>
                                    <Grid xs={12} md={4}>
                                      <PhotoUpload
                                        inputId={`t${ti}-c${ci}-e${ei}-equip`}
                                        label="Фото оборудования"
                                        photo={equipment.photos.equipment ?? null}
                                        onPhotoChange={(file) =>
                                          changeEquipmentPhoto(ti, ci, ei, 'equipment', file)
                                        }
                                        required
                                      />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                      <PhotoUpload
                                        inputId={`t${ti}-c${ci}-e${ei}-serial`}
                                        label="Фото серийного номера"
                                        photo={equipment.photos.serial ?? null}
                                        onPhotoChange={(file) =>
                                          changeEquipmentPhoto(ti, ci, ei, 'serial', file)
                                        }
                                        required
                                      />
                                    </Grid>
                                    {isNetworkEquipment(equipment.equipmentType) && (
                                      <Grid size={{ xs: 12, md: 4 }}>
                                        <PhotoUpload
                                          inputId={`t${ti}-c${ci}-e${ei}-mac`}
                                          label="Фото MAC-адреса"
                                          photo={equipment.photos.mac ?? null}
                                          onPhotoChange={(file) =>
                                            changeEquipmentPhoto(ti, ci, ei, 'mac', file)
                                          }
                                          required
                                        />
                                      </Grid>
                                    )}
                                  </Grid>
                                </Box>
                              )}

                              <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1}
                                justifyContent={{ sm: 'space-between' }}
                                alignItems={{ xs: 'stretch', sm: 'center' }}
                                mt={2}
                              >
                                <Button
                                  startIcon={<DeleteIcon />}
                                  onClick={() => removeEquipment(ti, ci, ei)}
                                  color="error"
                                  size="small"
                                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                                >
                                  Удалить оборудование
                                </Button>

                                <Button
                                  startIcon={<AddIcon />}
                                  onClick={() => addEquipment(ti, ci)}
                                  variant="text"
                                  size="small"
                                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                                >
                                  Добавить ещё
                                </Button>
                              </Stack>
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}

                      <Box
                        sx={{
                          mt: 1.5,
                          pt: 1,
                          borderTop: '1px dashed',
                          borderColor: 'divider',
                        }}
                      >
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => addEquipment(ti, ci)}
                          variant="contained"
                          fullWidth
                          size="medium"
                        >
                          Добавить оборудование
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={() => addCarriage(ti)}
              variant="contained"
              fullWidth
              sx={{ mt: 1 }}
            >
              Добавить вагон
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={addTrain}
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
      >
        Добавить поезд
      </Button>
    </Box>
  );
};
