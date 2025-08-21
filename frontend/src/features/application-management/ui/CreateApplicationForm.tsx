// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Stepper,
//   Step,
//   StepLabel,
//   Box,
//   Typography,
//   Alert,
//   CircularProgress,
//   Card,
//   CardContent,
//   LinearProgress,
//   Chip,
//   IconButton,
//   Fade,
//   Slide,
//   useTheme,
//   useMediaQuery,
// } from '@mui/material';
// import { ArrowBack, ArrowForward, Save, Close, SaveAlt } from '@mui/icons-material';
// import { APPLICATION_STEPS, FALLBACK_DATA } from '../../../shared';
// import { INITIAL_FORM_DATA } from '../../../shared';
// import { applicationApi } from '../../../entities';
// import type { CreateApplicationRequest, ApplicationFormData } from '../../../entities';
// import { referenceApi } from '../../../shared';
// import {
//   StepWorkType,
//   StepTrainNumber,
//   StepCarriages,
//   StepLocation,
//   StepWorkCompleted,
//   StepFinalPhoto,
// } from '../../../shared';
// import { useUser } from '../../../shared/contexts/UserContext';
//
// export const CreateApplicationForm = ({
//   open,
//   onClose,
//   draftId,
// }: {
//   open: boolean;
//   onClose: () => void;
//   draftId?: number;
// }) => {
//   console.log('draftID', draftId);
//   const { user } = useUser();
//   const [activeStep, setActiveStep] = useState(0);
//   const currentStep = APPLICATION_STEPS[activeStep];
//   const currentStepKey = currentStep?.key;
//   const [form, setForm] = useState<ApplicationFormData>(INITIAL_FORM_DATA);
//   const [loading, setLoading] = useState(false);
//   const [savingDraft, setSavingDraft] = useState(false);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [showExitConfirm, setShowExitConfirm] = useState(false);
//   const [isDraft, setIsDraft] = useState(!!draftId);
//
//   // Списки для select
//   const [workTypes, setWorkTypes] = useState<string[]>([]);
//   const [trainNumbers, setTrainNumbers] = useState<string[]>([]);
//   const [carriageTypes, setCarriageTypes] = useState<string[]>([]);
//   const [locations, setLocations] = useState<string[]>([]);
//
//   const theme = useTheme();
//   const isWidthSmScreen = useMediaQuery(theme.breakpoints.up('sm'));
//
//   useEffect(() => {
//     if (!open) return;
//     setActiveStep(0);
//     setForm({
//       ...INITIAL_FORM_DATA, // Ensure equipment is always an array
//     });
//     setSuccess(null);
//     setError(null);
//
//     // Загружаем черновик если передан draftId
//     if (draftId) {
//       loadDraft(draftId);
//     }
//
//     // Получаем списки из БД, если не пришли — используем fallback данные
//     referenceApi
//       .getAllReferences()
//       .then((data) => {
//         if (data && Object.keys(data).length > 0) {
//           setWorkTypes(data.typeWork || FALLBACK_DATA.workTypes);
//           setTrainNumbers(data.trainNumber || FALLBACK_DATA.trainNumbers);
//           setCarriageTypes(data.typeWagon || FALLBACK_DATA.carriageTypes);
//           console.log(data);
//
//           setLocations(data.currentLocation || FALLBACK_DATA.locations);
//         } else {
//           // Используем fallback данные если ответ пустой
//           setWorkTypes(FALLBACK_DATA.workTypes);
//           setTrainNumbers(FALLBACK_DATA.trainNumbers);
//           setCarriageTypes(FALLBACK_DATA.carriageTypes);
//           setLocations(FALLBACK_DATA.locations);
//         }
//       })
//       .catch((error) => {
//         // Используем fallback данные в случае ошибки
//         setWorkTypes(FALLBACK_DATA.workTypes);
//         setTrainNumbers(FALLBACK_DATA.trainNumbers);
//         setCarriageTypes(FALLBACK_DATA.carriageTypes);
//         setLocations(FALLBACK_DATA.locations);
//       });
//   }, [open, draftId]);
//
//   // Функция загрузки черновика
//   const loadDraft = async (id: number) => {
//     if (!user?.id) return;
//
//     try {
//       const drafts = await applicationApi.getDrafts(user.id, user.role);
//       console.log('333', drafts);
//       const draft = drafts.find((d) => d.id.toString() === id.toString());
//       console.log('222', draft);
//       if (draft) {
//         setForm({
//           workType: draft.carriages?.[0]?.equipment?.[0]?.typeWork || '',
//           trainNumber: draft.trainNumbers?.[0] || '',
//           carriages: (draft.carriages || []).map((carriage) => ({
//             carriageType: carriage.type || '',
//             carriageNumber: carriage.number || '',
//             carriagePhoto: null, // TODO: загрузка файлов из черновика
//             equipment: [], // Оборудование теперь хранится внутри вагонов
//           })),
//           workCompleted: draft.status || '',
//           location: draft.currentLocation || '',
//           photo: null,
//         });
//         setIsDraft(true);
//       }
//     } catch (error) {
//       console.error('Error loading draft:', error);
//       setError('Ошибка при загрузке черновика');
//     }
//   };
//
//   const handleChange = (field: string, value: string | number | File | null) => {
//     setForm((prev: ApplicationFormData) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };
//
//   // TODO: Как дойдут руки сделать абстрактный метод через Object
//   // Проверяем, есть ли прогресс в форме
//   const hasFormProgress = () => {
//     const hasEquipmentInCarriages = form.carriages?.some(
//       (carriage) => carriage.equipment && carriage.equipment.length > 0,
//     );
//
//     return (
//       activeStep > 0 ||
//       form.workType !== '' ||
//       form.trainNumber !== '' ||
//       (form.carriages && form.carriages.length > 0) ||
//       hasEquipmentInCarriages ||
//       form.workCompleted !== '' ||
//       form.location !== '' ||
//       form.photo !== null
//     );
//   };
//
//   // Обработка закрытия с подтверждением
//   const handleClose = () => {
//     if (hasFormProgress()) {
//       setShowExitConfirm(true);
//     } else {
//       onClose();
//     }
//   };
//
//   const handleConfirmExit = () => {
//     setShowExitConfirm(false);
//     onClose();
//   };
//
//   const handleCancelExit = () => {
//     setShowExitConfirm(false);
//   };
//
//   // Функция сохранения черновика
//   // TODO: Проверить роль пользователя - черновики должны быть доступны только инженерам
//   const saveDraft = async () => {
//     setSavingDraft(true);
//     setError(null);
//     setSuccess(null);
//
//     try {
//       if (!user?.id) {
//         setError('Требуется авторизация');
//         setSavingDraft(false);
//         return;
//       }
//
//       // Собираем объект новой схемы (БЕЗ файлов)
//       const requestTrains = [
//         {
//           trainNumber: form.trainNumber || '',
//           carriages: (form.carriages || []).map((c) => ({
//             carriageNumber: c.carriageNumber || '',
//             carriageType: c.carriageType || '',
//             // photos кладём отдельно (файлами), здесь только структура для значений
//             equipments: (c.equipment || []).map((e) => ({
//               equipmentName: e.equipmentType || '',
//               serialNumber: e.serialNumber || undefined,
//               macAddress: e.macAddress || undefined,
//               typeWork: form.workType || '',
//             })),
//           })),
//         },
//       ];
//
//       // Формируем FormData
//       const fd = new FormData();
//
//       // id обязателен для PUT-обновления черновика (наш бэк читает id из body)
//       if (draftId != null) fd.append('id', String(draftId));
//
//       fd.append('status', 'draft');
//       fd.append('userId', String(user.id));
//
//       // Эти поля в черновике не обязательны — передаём, если есть
//       if (form.workCompleted) fd.append('performer', form.workCompleted);
//       if (form.location) fd.append('currentLocation', form.location);
//
//       // Значения (без файлов) отдаём одним JSON-полем, чтобы бэк легко распарсил
//       fd.append('requestTrains', JSON.stringify(requestTrains));
//
//       // Теперь прикладываем ФАЙЛЫ по новым ключам
//       (form.carriages || []).forEach((carriage, ci) => {
//         // Фото вагона
//         if (carriage.carriagePhoto) {
//           fd.append(
//               `requestTrains[0][carriages][${ci}][carriagePhotos][carriage]`,
//               carriage.carriagePhoto
//           );
//         }
//         // Оборудование и его фото
//         (carriage.equipment || []).forEach((item, ei) => {
//           if (item?.photos?.equipment) {
//             fd.append(
//                 `requestTrains[0][carriages][${ci}][equipments][${ei}][photos][equipment]`,
//                 item.photos.equipment
//             );
//           }
//           if (item?.photos?.serial) {
//             fd.append(
//                 `requestTrains[0][carriages][${ci}][equipments][${ei}][photos][serial]`,
//                 item.photos.serial
//             );
//           }
//           if (item?.photos?.mac) {
//             fd.append(
//                 `requestTrains[0][carriages][${ci}][equipments][${ei}][photos][mac]`,
//                 item.photos.mac
//             );
//           }
//         });
//       });
//
//       // Вызов API
//       if (isDraft && draftId) {
//         await applicationApi.updateDraft(draftId, fd);
//       } else {
//         await applicationApi.saveDraft(fd);
//         setIsDraft(true);
//       }
//
//       setSuccess('Черновик успешно сохранён!');
//     } catch (error) {
//       console.error('Error saving draft:', error);
//       setError('Ошибка при сохранении черновика. Попробуйте ещё раз.');
//     } finally {
//       setSavingDraft(false);
//     }
//   };
//
//   // Функция сохранения черновика и выхода
//   const handleSaveAndExit = async () => {
//     await saveDraft();
//     if (!error) {
//       setShowExitConfirm(false);
//       onClose();
//     }
//   };
//
//   const handleNext = () =>
//     setActiveStep((prev) => {
//       return prev + 1;
//     });
//   const handleBack = () => setActiveStep((prev) => prev - 1);
//
//   const handleSubmit = async () => {
//     setLoading(true);
//     setSuccess(null);
//     setError(null);
//
//     try {
//       if (!user?.id) {
//         setError('Требуется авторизация');
//         setLoading(false);
//         return;
//       }
//
//       // статус: draft для черновика, completed для обычного сабмита
//       const status: 'draft' | 'completed' = isDraft ? 'draft' : 'completed';
//
//       // БАЗОВАЯ валидация под новый бэк (совпадает с серверной логикой)
//       if (status === 'completed') {
//         if (!form?.location) {
//           setError('Укажите текущую локацию');
//           setLoading(false);
//           return;
//         }
//         // performer: если нет явного поля в форме — возьмём имя текущего пользователя
//         if (!form?.workCompleted && !user?.name) {
//           setError('Укажите исполнителя');
//           setLoading(false);
//           return;
//         }
//         if (!form?.trainNumber || !form?.carriages?.length) {
//           setError('Нужно указать поезд и хотя бы один вагон');
//           setLoading(false);
//           return;
//         }
//         const hasAnyEquipment = (form.carriages || []).some(c => (c.equipment || []).length > 0);
//         if (!hasAnyEquipment) {
//           setError('В каждом поезде должен быть хотя бы один вагон с оборудованием');
//           setLoading(false);
//           return;
//         }
//       }
//
//       // === Формируем payload новой схемы ===
//       const requestData: CreateApplicationRequest = {
//         id: draftId ?? undefined,
//         status,
//         userId: user.id,
//         performer: form?.workCompleted || user?.name || '—',     // можно заменить, если у тебя есть отдельное поле
//         currentLocation: form.location || '',
//         requestTrains: [
//           {
//             trainNumber: form.trainNumber,
//             carriages: (form.carriages || []).map((carriage) => ({
//               carriageNumber: carriage.carriageNumber,
//               carriageType: carriage.carriageType,
//
//               // если у тебя только одно фото вагона — кладём его как "carriage"
//               carriagePhotos: carriage.carriagePhoto
//                   ? { carriage: carriage.carriagePhoto, equipment: form.photo }
//                   : undefined,
//
//               // оборудование вагона
//               equipments: (carriage.equipment || []).map((item) => ({
//                 // раньше было equipmentType — теперь equipmentName
//                 equipmentName: item.equipmentType || '',
//                 serialNumber: item.serialNumber || undefined,
//                 macAddress: item.macAddress || undefined,
//                 // если workType общий на форму — подставим его; поддерживаю и item.typeWork если вдруг появится
//                 typeWork: form.workType || '',
//
//                 // новые ключи фото строго: equipment | serial | mac
//                 photos: {
//                   equipment: item.photos?.equipment ?? null,
//                   serial: item.photos?.serial ?? null,
//                   mac: item.photos?.mac ?? null,
//                 },
//               })),
//             })),
//           },
//         ],
//       };
//
//
//       if (isDraft && draftId) {
//         // Завершаем черновик
//         await applicationApi.completeDraft(draftId, requestData);
//       } else {
//         // Создаем новую заявку
//         console.log(requestData);
//
//         await applicationApi.create(requestData);
//       }
//
//       setSuccess('Заявка успешно создана!');
//       setError(null);
//
//       // Сброс формы после успешной отправки
//       setTimeout(() => {
//         onClose();
//       }, 2000);
//     } catch (error) {
//       console.error('Error creating application:', error);
//
//       // Детальное логгирование ошибки
//       console.error('=== ДЕТАЛИ ОШИБКИ СОЗДАНИЯ ЗАЯВКИ ===');
//       console.error('Тип ошибки:', error?.constructor?.name);
//       console.error('Сообщение ошибки:', error?.message);
//       console.error('Статус ответа:', error?.response?.status);
//       console.error('Данные ответа:', error?.response?.data);
//       console.error('Заголовки ответа:', error?.response?.headers);
//       console.error('URL запроса:', error?.config?.url);
//       console.error('Метод запроса:', error?.config?.method);
//       console.error('Данные запроса:', error?.config?.data);
//       console.error('Полный стек ошибки:', error?.stack);
//       console.error('Данные формы на момент ошибки:', {
//         isDraft,
//         draftId,
//         formData: form,
//         requestData: {
//           status: 'completed',
//           typeWork: form.workType,
//           trainNumber: form.trainNumber,
//           carriages: form.carriages,
//           completedJob: form.workCompleted,
//           currentLocation: form.location,
//           userId: user?.id,
//           userName: user?.name,
//           userRole: user?.role,
//         },
//       });
//       console.error('=== КОНЕЦ ДЕТАЛЬНОГО ЛОГГИРОВАНИЯ ===');
//
//       // Определяем более конкретное сообщение об ошибке для пользователя
//       let userErrorMessage = 'Ошибка при создании заявки. Попробуйте еще раз.';
//
//       if (error?.response?.status === 400) {
//         userErrorMessage = 'Ошибка валидации данных. Проверьте правильность заполнения формы.';
//       } else if (error?.response?.status === 401) {
//         userErrorMessage = 'Ошибка авторизации. Войдите в систему заново.';
//       } else if (error?.response?.status === 403) {
//         userErrorMessage = 'Недостаточно прав для создания заявки.';
//       } else if (error?.response?.status === 404) {
//         userErrorMessage = 'Сервис недоступен. Обратитесь к администратору.';
//       } else if (error?.response?.status >= 500) {
//         userErrorMessage = 'Ошибка сервера. Попробуйте позже или обратитесь к администратору.';
//       } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
//         userErrorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
//       }
//
//       setError(userErrorMessage);
//       setSuccess(null);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   // Универсальная валидация для этапа
//   const isNextDisabled = () => {
//     const step = APPLICATION_STEPS[activeStep];
//
//     switch (step.key) {
//       case 'workType':
//         return !form.workType;
//       case 'trainNumber':
//         return !form.trainNumber;
//       case 'carriages':
//         // Проверяем базовые поля вагонов
//         if (!form.carriages || form.carriages.length === 0) {
//           return true;
//         }
//
//         return form.carriages.some((carriage) => {
//           // Проверяем обязательные поля вагона
//           if (!carriage.carriageNumber || !carriage.carriageType || !carriage.carriagePhoto) {
//             return true;
//           }
//
//           // Проверяем оборудование вагона (если есть)
//           if (carriage.equipment && carriage.equipment.length > 0) {
//             return carriage.equipment.some((item) => {
//               // Базовая валидация - тип оборудования и серийный номер обязательны
//               if (!item.equipmentType || !item.serialNumber) {
//                 return true;
//               }
//
//               // Фото серийного номера обязательно
//               if (!item.photos?.serial) {
//                 return true;
//               }
//
//               // MAC адрес обязателен только для определенных типов оборудования
//               const needsMac =
//                 item.equipmentType.toLowerCase().includes('точка доступа') ||
//                 item.equipmentType.toLowerCase().includes('маршрутизатор') ||
//                 item.equipmentType.toLowerCase().includes('коммутатор');
//
//               if (needsMac) {
//                 // Проверяем наличие MAC адреса
//                 if (!item.macAddress) {
//                   return true;
//                 }
//
//                 // Проверяем валидность MAC адреса
//                 const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
//                 if (!macRegex.test(item.macAddress)) {
//                   return true;
//                 }
//
//                 // Фото MAC адреса обязательно для оборудования с MAC
//                 if (!item.photos?.mac) {
//                   return true;
//                 }
//               }
//
//               return false;
//             });
//           }
//
//           return false;
//         });
//       case 'workCompleted':
//         return !form.workCompleted;
//       case 'location':
//         return !form.location;
//       case 'finalPhoto':
//         return !form.photo;
//       default:
//         return false;
//     }
//   };
//
//   const renderStep = () => {
//     switch (currentStepKey) {
//       case 'workType':
//         return <StepWorkType value={form.workType} onChange={handleChange} options={workTypes} />;
//       case 'trainNumber':
//         return (
//           <StepTrainNumber
//             value={form.trainNumber}
//             onChange={handleChange}
//             options={trainNumbers}
//           />
//         );
//       case 'carriages':
//         return (
//           <StepCarriages
//             carriages={form.carriages || []}
//             onCarriagesChange={(carriages) => setForm((prev) => ({ ...prev, carriages }))}
//           />
//         );
//
//       case 'workCompleted':
//         return <StepWorkCompleted value={form.workCompleted} onChange={handleChange} />;
//       case 'location':
//         return <StepLocation value={form.location} onChange={handleChange} options={locations} />;
//       case 'finalPhoto':
//         return (
//           <StepFinalPhoto
//             formData={form}
//             onFormDataChange={(data) => setForm((prev) => ({ ...prev, ...data }))}
//           />
//         );
//       default:
//         return <div>Неизвестный шаг</div>;
//     }
//   };
//
//   return (
//     <>
//       <Dialog
//         open={open}
//         onClose={handleClose}
//         disableEscapeKeyDown={hasFormProgress()}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 3,
//             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//             color: 'white',
//           },
//         }}
//       >
//         <DialogTitle sx={{ pb: 1, pl: { xs: 2, sm: 3 } }}>
//           <Box display="flex" justifyContent="space-between" alignItems="center">
//             <Typography variant="h5" fontWeight="bold">
//               🔧 Создание заявки
//             </Typography>
//             <IconButton onClick={handleClose} sx={{ color: 'white' }}>
//               <Close />
//             </IconButton>
//           </Box>
//
//           {/* Прогресс-бар */}
//           <Box mt={2}>
//             <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
//               <Typography variant="body2">
//                 Шаг {activeStep + 1} из {APPLICATION_STEPS.length}
//               </Typography>
//               <Chip
//                 label={`${Math.round(((activeStep + 1) / APPLICATION_STEPS.length) * 100)}%`}
//                 size="small"
//                 sx={{
//                   bgcolor: 'rgba(255,255,255,0.2)',
//                   color: 'white',
//                   fontWeight: 'bold',
//                 }}
//               />
//             </Box>
//             <LinearProgress
//               variant="determinate"
//               value={((activeStep + 1) / APPLICATION_STEPS.length) * 100}
//               sx={{
//                 height: 8,
//                 borderRadius: 4,
//                 bgcolor: 'rgba(255,255,255,0.2)',
//                 '& .MuiLinearProgress-bar': {
//                   borderRadius: 4,
//                   bgcolor: '#4caf50',
//                 },
//               }}
//             />
//           </Box>
//
//           {/* Навигация по шагам */}
//           <Box mt={3}>
//             <Stepper
//               activeStep={activeStep}
//               alternativeLabel={isWidthSmScreen}
//               sx={{
//                 // display:"flex",
//                 // flexWrap:"wrap",
//                 // flexDirection:"column",
//                 '& .MuiStepLabel-label': {
//                   color: 'rgba(255,255,255,0.8)',
//                   fontSize: '0.75rem',
//                 },
//                 '& .MuiStepLabel-label.Mui-active': {
//                   color: 'white',
//                   fontWeight: 'bold',
//                 },
//                 '& .MuiStepLabel-label.Mui-completed': {
//                   color: '#4caf50',
//                 },
//                 '& .MuiStepIcon-root': {
//                   color: 'rgba(255,255,255,0.3)',
//                 },
//                 '& .MuiStepIcon-root.Mui-active': {
//                   color: '#4caf50',
//                 },
//                 '& .MuiStepIcon-root.Mui-completed': {
//                   color: '#4caf50',
//                 },
//               }}
//             >
//               {APPLICATION_STEPS.map((step) => (
//                 <Step key={step.key}>
//                   {isWidthSmScreen ? (
//                     <StepLabel>{step.label}</StepLabel>
//                   ) : (
//                     <StepLabel
//                       sx={{ width: { xs: 20, sm: 'auto' }, height: { xs: 45, sm: 'auto' } }}
//                     >
//                       {}
//                     </StepLabel>
//                   )}
//                 </Step>
//               ))}
//             </Stepper>
//           </Box>
//         </DialogTitle>
//
//         <DialogContent sx={{ bgcolor: 'white', color: 'black', p: { xs: 1, sm: 3 } }}>
//           <Card
//             elevation={0}
//             sx={{
//               mt: 2,
//               background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
//               borderRadius: 3,
//             }}
//           >
//             <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
//               <Fade in timeout={500}>
//                 <Box>{renderStep()}</Box>
//               </Fade>
//             </CardContent>
//           </Card>
//
//           {success && (
//             <Slide direction="up" in={!!success} mountOnEnter unmountOnExit>
//               <Alert
//                 severity="success"
//                 sx={{
//                   mt: 2,
//                   borderRadius: 2,
//                   '& .MuiAlert-icon': {
//                     fontSize: '1.5rem',
//                   },
//                 }}
//               >
//                 {success}
//               </Alert>
//             </Slide>
//           )}
//
//           {error && (
//             <Slide direction="up" in={!!error} mountOnEnter unmountOnExit>
//               <Alert
//                 severity="error"
//                 sx={{
//                   mt: 2,
//                   borderRadius: 2,
//                   '& .MuiAlert-icon': {
//                     fontSize: '1.5rem',
//                   },
//                 }}
//               >
//                 {error}
//               </Alert>
//             </Slide>
//           )}
//         </DialogContent>
//
//         <DialogActions
//           sx={{ bgcolor: 'white', borderRadius: '0 0 12px 12px', p: { xs: 1, sm: 3 } }}
//         >
//           <Box
//             display="flex"
//             gap={0.5}
//             justifyContent="space-between"
//             alignItems="center"
//             width="100%"
//           >
//             <Button
//               disabled={activeStep === 0}
//               onClick={handleBack}
//               startIcon={<ArrowBack />}
//               variant="outlined"
//               sx={{
//                 fontSize: {
//                   xs: '0.65rem',
//                   sm: '0.85rem',
//                 },
//                 borderRadius: 3,
//                 px: 3,
//                 py: 1.5,
//                 borderColor: '#667eea',
//                 color: '#667eea',
//                 '&:hover': {
//                   borderColor: '#764ba2',
//                   bgcolor: 'rgba(102, 126, 234, 0.1)',
//                 },
//               }}
//             >
//               Назад
//             </Button>
//
//             <Box display="flex" gap={{ xs: 0.2, sm: 2 }} alignItems="center">
//               <Typography
//                 variant="body2"
//                 color="text.secondary"
//                 fontSize={{ xs: '0.65rem', sm: '0.75rem' }}
//               >
//                 {APPLICATION_STEPS[activeStep].label}
//               </Typography>
//               <Button
//                 variant="contained"
//                 onClick={activeStep === APPLICATION_STEPS.length - 1 ? handleSubmit : handleNext}
//                 // disabled={isNextDisabled() || loading}
//                 endIcon={
//                   loading ? (
//                     <CircularProgress size={20} color="inherit" />
//                   ) : activeStep === APPLICATION_STEPS.length - 1 ? (
//                     <Save />
//                   ) : (
//                     <ArrowForward />
//                   )
//                 }
//                 sx={{
//                   borderRadius: 3,
//                   fontSize: { xs: '0.58rem', sm: '0.88rem' },
//                   px: 4,
//                   py: 1.5,
//                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                   '&:hover': {
//                     background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
//                   },
//                 }}
//               >
//                 {activeStep === APPLICATION_STEPS.length - 1 ? 'Создать заявку' : 'Далее'}
//               </Button>
//             </Box>
//           </Box>
//         </DialogActions>
//       </Dialog>
//
//       {/* Диалог подтверждения выхода */}
//       <Dialog open={showExitConfirm} onClose={handleCancelExit} maxWidth="sm" fullWidth>
//         <DialogTitle>
//           <Typography variant="h6" fontWeight="bold">
//             ⚠️ Подтверждение выхода
//           </Typography>
//         </DialogTitle>
//         <DialogContent>
//           <Typography>
//             У вас есть несохраненные изменения в заявке. Что вы хотите сделать?
//           </Typography>
//         </DialogContent>
//         <DialogActions sx={{ px: { xs: 0.4, sm: 1 }, pt: 0, pb: { xs: 0.4, sm: 1 } }}>
//           <Button
//             onClick={handleCancelExit}
//             variant="outlined"
//             // sx={{
//             //   fontSize: { xs: '0.66rem', sm: '0.88rem' },
//             // }}
//           >
//             Отмена
//           </Button>
//           <Button
//             onClick={handleSaveAndExit}
//             variant="contained"
//             color="warning"
//             startIcon={<SaveAlt />}
//             disabled={savingDraft}
//             sx={{
//               fontSize: { xs: '0.45rem', sm: '0.88rem' },
//               width: { xs: 120, sm: 'auto' },
//               height: { xs: 57, sm: 'auto' },
//             }}
//           >
//             {savingDraft ? 'Сохранение...' : 'Сохранить черновик и выйти'}
//           </Button>
//           <Button
//             onClick={handleConfirmExit}
//             variant="contained"
//             color="error"
//             sx={{
//               fontSize: { xs: '0.66rem', sm: '0.88rem' },
//             }}
//           >
//             Выйти без сохранения
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ArrowBack, ArrowForward, Save, Close, SaveAlt } from '@mui/icons-material';

import {
  APPLICATION_STEPS,
  FALLBACK_DATA,
  StepCarriages,
  StepLocation,
  StepWorkCompleted,
  StepFinalPhoto,
} from '../../../shared';
import { INITIAL_FORM_DATA } from '../../../shared';
import { applicationApi } from '../../../entities';
import type {
  CreateApplicationRequest,
  ApplicationFormData,
  TrainFormItem,
  CarriageFormItem,
  EquipmentFormItem,
} from '../../../entities';
import { referenceApi } from '../../../shared';
import { useUser } from '../../../shared/contexts/UserContext';

export const CreateApplicationForm = ({
  open,
  onClose,
  draftId,
}: {
  open: boolean;
  onClose: () => void;
  draftId?: number;
}) => {
  const { user } = useUser();
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = APPLICATION_STEPS[activeStep];
  const currentStepKey = currentStep?.key as string | undefined;

  const [form, setForm] = useState<ApplicationFormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isDraft, setIsDraft] = useState(!!draftId);

  // только для шага Location
  const [locations, setLocations] = useState<string[]>([]);

  const theme = useTheme();
  const isWidthSmScreen = useMediaQuery(theme.breakpoints.up('sm'));

  useEffect(() => {
    if (!open) return;
    setActiveStep(0);
    setForm({ ...INITIAL_FORM_DATA });
    setSuccess(null);
    setError(null);

    // Черновик
    if (draftId) {
      loadDraft(draftId);
    }

    // Локации (остальные справочники тянет StepCarriages внутри себя)
    referenceApi
      .getLocations()
      .then((locs) => setLocations(locs?.length ? locs : FALLBACK_DATA.locations))
      .catch(() => setLocations(FALLBACK_DATA.locations));
  }, [open, draftId]);

  // --- Загрузка черновика и маппинг в новую форму ---
  const loadDraft = async (id: number) => {
    if (!user?.id) return;
    try {
      const drafts = await applicationApi.getDrafts(user.id, user.role);
      console.log(drafts);

      const draft = drafts.find((d) => d.id.toString() === id.toString());
      if (draft) {
        // draft.carriages: [{ number, type, train, equipment: [...] }]
        // сгруппируем по номеру поезда
        const byTrain = new Map<string, CarriageFormItem[]>();
        for (const c of draft.carriages || []) {
          const key = c.train || '';
          const arr = byTrain.get(key) || [];
          const mappedEquip: EquipmentFormItem[] = (c.equipment || []).map((e) => ({
            equipmentType: e.name || '',
            typeWork: e.typeWork || '',
            serialNumber: e.serialNumber && e.serialNumber !== '—' ? e.serialNumber : '',
            macAddress: e.macAddress && e.macAddress !== '—' ? e.macAddress : '',
            quantity: 1,
            carriageId: undefined,
            photos: {
              equipment: e.photos.find((el) => el.type === 'equipment')?.path
                ? new File([], e.photos.find((el) => el.type === 'equipment')!.path)
                : null,
              serial: e.photos.find((el) => el.type === 'serial')?.path
                ? new File([], e.photos.find((el) => el.type === 'serial')!.path)
                : null,
              mac: null,
            },
          }));

          arr.push({
            id: undefined,
            carriageNumber: c.number || '',
            carriageType: c.type || '',
            carriagePhotos: {
              carriage: c.photo ? new File([], c.photo) : null,
              equipment: c.generalPhotoEquipmentCarriage ? new File([], c.generalPhotoEquipmentCarriage) : null,
            },
            equipment: mappedEquip,
          });
          byTrain.set(key, arr);
        }

        const trains: TrainFormItem[] = Array.from(byTrain.entries()).map(
          ([trainNumber, carriages]) => ({
            trainNumber: trainNumber || '',
            carriages,
          }),
        );

        setForm({
          trains: trains.length ? trains : [{ trainNumber: '', carriages: [] }],
          workCompleted: draft.performer || '',
          location: draft.currentLocation || '',
          status: 'draft',
        });
        setIsDraft(true);
      }
    } catch (e) {
      console.error('Error loading draft:', e);
      setError('Ошибка при загрузке черновика');
    }
  };

  const handleChange = (field: keyof ApplicationFormData, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Есть ли прогресс?
  const hasFormProgress = () => {
    const hasAnyTrain =
      (form.trains?.length ?? 0) > 0 &&
      form.trains.some((t) => t.trainNumber || (t.carriages?.length ?? 0) > 0);
    const hasAnyEquip = form.trains?.some((t) =>
      t.carriages?.some((c) => (c.equipment?.length ?? 0) > 0),
    );
    return (
      activeStep > 0 || hasAnyTrain || !!hasAnyEquip || !!form.workCompleted || !!form.location
    );
  };

  // Закрытие
  const handleClose = () => {
    if (hasFormProgress()) setShowExitConfirm(true);
    else onClose();
  };
  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    onClose();
  };
  const handleCancelExit = () => setShowExitConfirm(false);

  // --- Сохранить черновик (FormData) ---
  const saveDraft = async () => {
    setSavingDraft(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user?.id) {
        setError('Требуется авторизация');
        setSavingDraft(false);
        return;
      }

      const fd = new FormData();
      if (draftId != null) fd.append('id', String(draftId));
      fd.append('status', 'draft');
      fd.append('userId', String(user.id));
      if (form.workCompleted) fd.append('performer', form.workCompleted);
      if (form.location) fd.append('currentLocation', form.location);

      // JSON часть (без файлов)
      const requestTrainsJson = (form.trains || []).map((t) => ({
        trainNumber: t.trainNumber || '',
        carriages: (t.carriages || []).map((c) => ({
          carriageNumber: c.carriageNumber || '',
          carriageType: c.carriageType || '',
          equipments: (c.equipment || []).map((e) => ({
            equipmentName: e.equipmentType || '',
            serialNumber: e.serialNumber || undefined,
            macAddress: e.macAddress || undefined,
            typeWork: e.typeWork || '', // тип работ теперь на уровне оборудования
          })),
        })),
      }));
      fd.append('requestTrains', JSON.stringify(requestTrainsJson));

      // Файлы
      (form.trains || []).forEach((t, ti) => {
        (t.carriages || []).forEach((c, ci) => {
          if (c.carriagePhotos?.carriage) {
            fd.append(
              `requestTrains[${ti}][carriages][${ci}][carriagePhotos][carriage]`,
              c.carriagePhotos.carriage,
            );
          }
          if (c.carriagePhotos?.equipment) {
            fd.append(
              `requestTrains[${ti}][carriages][${ci}][carriagePhotos][equipment]`,
              c.carriagePhotos.equipment,
            );
          }
          (c.equipment || []).forEach((e, ei) => {
            if (e.photos?.equipment) {
              fd.append(
                `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][photos][equipment]`,
                e.photos.equipment,
              );
            }
            if (e.photos?.serial) {
              fd.append(
                `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][photos][serial]`,
                e.photos.serial,
              );
            }
            if (e.photos?.mac) {
              fd.append(
                `requestTrains[${ti}][carriages][${ci}][equipments][${ei}][photos][mac]`,
                e.photos.mac,
              );
            }
          });
        });
      });

      // API
      if (isDraft && draftId) {
        await applicationApi.updateDraft(draftId, fd);
        console.log('1111');
      } else {
        console.log('222');

        await applicationApi.saveDraft(fd);
        setIsDraft(true);
      }

      setSuccess('Черновик успешно сохранён!');
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Ошибка при сохранении черновика. Попробуйте ещё раз.');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSaveAndExit = async () => {
    await saveDraft();
    if (!error) {
      setShowExitConfirm(false);
      onClose();
    }
  };

  const handleNext = () => setActiveStep((p) => p + 1);
  const handleBack = () => setActiveStep((p) => p - 1);

  // --- Сабмит заявки ---
  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      if (!user?.id) {
        setError('Требуется авторизация');
        setLoading(false);
        return;
      }

      const status: 'draft' | 'completed' = isDraft ? 'draft' : 'completed';

      // Базовая валидация completed
      if (status === 'completed') {
        if (!form.location) {
          setError('Укажите текущую локацию');
          setLoading(false);
          return;
        }
        if (!form.workCompleted && !user?.name) {
          setError('Укажите исполнителя');
          setLoading(false);
          return;
        }
        if (!form.trains?.length) {
          setError('Добавьте хотя бы один поезд');
          setLoading(false);
          return;
        }
        const hasAnyEquipment = form.trains.some((t) =>
          (t.carriages || []).some((c) => (c.equipment || []).length > 0),
        );
        if (!hasAnyEquipment) {
          setError('В заявке должен быть хотя бы один вагон с оборудованием');
          setLoading(false);
          return;
        }
      }

      const requestData: CreateApplicationRequest = {
        id: draftId ?? undefined,
        status,
        userId: user.id,
        performer: form.workCompleted || user.name || '—',
        currentLocation: form.location || '',
        requestTrains: (form.trains || []).map((t) => ({
          trainNumber: t.trainNumber,
          carriages: (t.carriages || []).map((c) => ({
            carriageNumber: c.carriageNumber,
            carriageType: c.carriageType,
            carriagePhotos: c.carriagePhotos, // { carriage, equipment } — файлы прилетят в FormData на бэке
            equipments: (c.equipment || []).map((e) => ({
              equipmentName: e.equipmentType || '',
              serialNumber: e.serialNumber || undefined,
              macAddress: e.macAddress || undefined,
              typeWork: e.typeWork || '', // тип работ с оборудования
              photos: {
                equipment: e.photos?.equipment ?? null,
                serial: e.photos?.serial ?? null,
                mac: e.photos?.mac ?? null,
              },
            })),
          })),
        })),
      };

      if (isDraft && draftId) {
        await applicationApi.completeDraft(draftId, requestData);
      } else {
        await applicationApi.create(requestData);
      }

      setSuccess('Заявка успешно создана!');
      setError(null);
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      console.error('Error creating application:', err);

      let userErrorMessage = 'Ошибка при создании заявки. Попробуйте еще раз.';
      if (err?.response?.status === 400)
        userErrorMessage = 'Ошибка валидации данных. Проверьте правильность заполнения формы.';
      else if (err?.response?.status === 401)
        userErrorMessage = 'Ошибка авторизации. Войдите в систему заново.';
      else if (err?.response?.status === 403)
        userErrorMessage = 'Недостаточно прав для создания заявки.';
      else if (err?.response?.status === 404)
        userErrorMessage = 'Сервис недоступен. Обратитесь к администратору.';
      else if (err?.response?.status >= 500)
        userErrorMessage = 'Ошибка сервера. Попробуйте позже или обратитесь к администратору.';
      else if (err?.code === 'NETWORK_ERROR' || err?.message?.includes('Network Error'))
        userErrorMessage = 'Ошибка сети. Проверьте подключение к интернету.';

      setError(userErrorMessage);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  // Валидация для кнопки "Далее" (если хочешь включить disable)
  const isNextDisabled = () => {
    const step = APPLICATION_STEPS[activeStep];
    switch (step.key) {
      case 'carriages': {
        const trains = form.trains || [];
        if (!trains.length) return true;
        const invalid = trains.some(
          (t) =>
            !t.trainNumber ||
            !t.carriages?.length ||
            t.carriages.some(
              (c) =>
                !c.carriageNumber ||
                !c.carriageType ||
                !c.carriagePhotos?.carriage ||
                !c.carriagePhotos?.equipment ||
                !c.equipment?.length ||
                c.equipment.some((e) => {
                  const needMac = ['точка доступа', 'маршрутизатор', 'коммутатор'].some((k) =>
                    e.equipmentType.toLowerCase().includes(k),
                  );
                  const baseBad =
                    !e.equipmentType ||
                    !e.typeWork ||
                    !e.serialNumber ||
                    !e.photos?.equipment ||
                    !e.photos?.serial;
                  const macBad =
                    needMac &&
                    (!e.macAddress ||
                      !/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(e.macAddress) ||
                      !e.photos?.mac);
                  return baseBad || macBad;
                }),
            ),
        );
        return invalid;
      }
      case 'workCompleted':
        return !form.workCompleted;
      case 'location':
        return !form.location;
      case 'finalPhoto':
        // если финальную фото хочешь сделать не обязательной — верни false
        return !form.photo;
      default:
        return false;
    }
  };

  const renderStep = () => {
    console.log(form);

    switch (currentStepKey) {
      case 'carriages':
        return (
          <StepCarriages
            trains={form.trains}
            onTrainsChange={(trains) => setForm((prev) => ({ ...prev, trains }))}
          />
        );
      case 'workCompleted':
        return <StepWorkCompleted value={form.workCompleted} onChange={handleChange as any} />;
      case 'location':
        return (
          <StepLocation value={form.location} onChange={handleChange as any} options={locations} />
        );
      case 'finalPhoto':
        return (
          <StepFinalPhoto
            formData={form}
            onFormDataChange={(data) => setForm((prev) => ({ ...prev, ...data }))}
          />
        );
      default:
        return <div>Неизвестный шаг</div>;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        disableEscapeKeyDown={hasFormProgress()}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pl: { xs: 2, sm: 3 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold">
              🔧 Создание заявки
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>

          {/* Прогресс-бар */}
          <Box mt={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2">
                Шаг {activeStep + 1} из {APPLICATION_STEPS.length}
              </Typography>
              <Chip
                label={`${Math.round(((activeStep + 1) / APPLICATION_STEPS.length) * 100)}%`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={((activeStep + 1) / APPLICATION_STEPS.length) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: '#4caf50',
                },
              }}
            />
          </Box>

          {/* Навигация по шагам */}
          <Box mt={3}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel={isWidthSmScreen}
              sx={{
                '& .MuiStepLabel-label': {
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.75rem',
                },
                '& .MuiStepLabel-label.Mui-active': {
                  color: 'white',
                  fontWeight: 'bold',
                },
                '& .MuiStepLabel-label.Mui-completed': {
                  color: '#4caf50',
                },
                '& .MuiStepIcon-root': {
                  color: 'rgba(255,255,255,0.3)',
                },
                '& .MuiStepIcon-root.Mui-active': {
                  color: '#4caf50',
                },
                '& .MuiStepIcon-root.Mui-completed': {
                  color: '#4caf50',
                },
              }}
            >
              {APPLICATION_STEPS.map((step) => (
                <Step key={step.key}>
                  {isWidthSmScreen ? (
                    <StepLabel>{step.label}</StepLabel>
                  ) : (
                    <StepLabel
                      sx={{ width: { xs: 20, sm: 'auto' }, height: { xs: 45, sm: 'auto' } }}
                    >
                      {}
                    </StepLabel>
                  )}
                </Step>
              ))}
            </Stepper>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ bgcolor: 'white', color: 'black', p: { xs: 1, sm: 3 } }}>
          <Card
            elevation={0}
            sx={{
              mt: 2,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Fade in timeout={500}>
                <Box>{renderStep()}</Box>
              </Fade>
            </CardContent>
          </Card>

          {success && (
            <Slide direction="up" in={!!success} mountOnEnter unmountOnExit>
              <Alert
                severity="success"
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  '& .MuiAlert-icon': { fontSize: '1.5rem' },
                }}
              >
                {success}
              </Alert>
            </Slide>
          )}

          {error && (
            <Slide direction="up" in={!!error} mountOnEnter unmountOnExit>
              <Alert
                severity="error"
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  '& .MuiAlert-icon': { fontSize: '1.5rem' },
                }}
              >
                {error}
              </Alert>
            </Slide>
          )}
        </DialogContent>

        <DialogActions
          sx={{ bgcolor: 'white', borderRadius: '0 0 12px 12px', p: { xs: 1, sm: 3 } }}
        >
          <Box
            display="flex"
            gap={0.5}
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
              variant="outlined"
              sx={{
                fontSize: { xs: '0.65rem', sm: '0.85rem' },
                borderRadius: 3,
                px: 3,
                py: 1.5,
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#764ba2',
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                },
              }}
            >
              Назад
            </Button>

            <Box display="flex" gap={{ xs: 0.2, sm: 2 }} alignItems="center">
              <Typography
                variant="body2"
                color="text.secondary"
                fontSize={{ xs: '0.65rem', sm: '0.75rem' }}
              >
                {APPLICATION_STEPS[activeStep].label}
              </Typography>
              <Button
                variant="contained"
                onClick={activeStep === APPLICATION_STEPS.length - 1 ? handleSubmit : handleNext}
                // включить блокировку, если хочешь
                // disabled={isNextDisabled() || loading}
                endIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : activeStep === APPLICATION_STEPS.length - 1 ? (
                    <Save />
                  ) : (
                    <ArrowForward />
                  )
                }
                sx={{
                  borderRadius: 3,
                  fontSize: { xs: '0.58rem', sm: '0.88rem' },
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                }}
              >
                {activeStep === APPLICATION_STEPS.length - 1 ? 'Создать заявку' : 'Далее'}
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения выхода */}
      <Dialog open={showExitConfirm} onClose={handleCancelExit} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            ⚠️ Подтверждение выхода
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            У вас есть несохраненные изменения в заявке. Что вы хотите сделать?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 0.4, sm: 1 }, pt: 0, pb: { xs: 0.4, sm: 1 } }}>
          <Button onClick={handleCancelExit} variant="outlined">
            Отмена
          </Button>
          <Button
            onClick={handleSaveAndExit}
            variant="contained"
            color="warning"
            startIcon={<SaveAlt />}
            disabled={savingDraft}
            sx={{
              fontSize: { xs: '0.45rem', sm: '0.88rem' },
              width: { xs: 120, sm: 'auto' },
              height: { xs: 57, sm: 'auto' },
            }}
          >
            {savingDraft ? 'Сохранение...' : 'Сохранить черновик и выйти'}
          </Button>
          <Button onClick={handleConfirmExit} variant="contained" color="error">
            Выйти без сохранения
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
