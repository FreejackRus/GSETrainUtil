import { Request, Response } from 'express';
import { createMulterConfig, getRelativeFilePath, createFileUrl } from '../../utils/fileStorage';

const upload = createMulterConfig();

export const uploadPhoto = (req: Request, res: Response) => {
  const uploadSingle = upload.single('photo');
  
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Файл не был загружен'
      });
    }
    
    const relativePath = getRelativeFilePath(req.file.path);
    const fileUrl = createFileUrl(relativePath);
    
    res.status(200).json({
      success: true,
      message: 'Файл успешно загружен',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: relativePath,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  });
};

export const uploadMultiplePhotos = (req: Request, res: Response) => {
  const uploadMultiple = upload.array('photos', 10); // максимум 10 файлов
  
  uploadMultiple(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Файлы не были загружены'
      });
    }
    
    const uploadedFiles = req.files.map(file => {
      const relativePath = getRelativeFilePath(file.path);
      const fileUrl = createFileUrl(relativePath);
      
      return {
        filename: file.filename,
        originalName: file.originalname,
        path: relativePath,
        url: fileUrl,
        size: file.size,
        mimetype: file.mimetype
      };
    });
    
    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} файлов успешно загружено`,
      data: uploadedFiles
    });
  });
};