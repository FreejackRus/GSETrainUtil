import express, { Request, Response, Router } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { routerDevice } from "./router/routerDevice";
import { routerCarriage } from "./router/routerCarriage";
import { routerWorkLog } from "./router/routerWorkLog";
import { routerPdfGenerate } from "./router/routerPdfGenerate";
import archiveRoutes from "./routes/archiveRoutes";
import multer from "multer";

const app = express();
const upload = multer();
const port = 3000;

app.use(bodyParser.json());

app.use(upload.any());
app.use(express.static('public'));

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Range'],
  })
);

// Обработка preflight OPTIONS запросов
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Range');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.status(200).end();
  } else {
    next();
  }
});

// Регистрируем API роуты ПЕРЕД статическими файлами
app.use("/api/v1", routerDevice);
app.use("/api/v1", routerCarriage);
app.use("/api/v1", routerWorkLog);
app.use("/api/v1", routerPdfGenerate);
app.use("/api/v1/archive", archiveRoutes);

// Middleware для декодирования URL и обслуживания статических файлов (изображений)
app.use('/uploads', (req, res, next) => {
  try {
    // Декодируем URL для правильной обработки кириллических символов
    req.url = decodeURIComponent(req.url);
  } catch (error) {
    console.error('URL decode error:', error);
  }
  next();
}, express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res, filePath) => {
    // Добавляем CORS заголовки для изображений
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Range');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Устанавливаем правильный Content-Type для изображений
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.png':
        res.setHeader('Content-Type', 'image/png');
        break;
      case '.jpg':
      case '.jpeg':
        res.setHeader('Content-Type', 'image/jpeg');
        break;
      case '.gif':
        res.setHeader('Content-Type', 'image/gif');
        break;
      case '.svg':
        res.setHeader('Content-Type', 'image/svg+xml');
        break;
      case '.webp':
        res.setHeader('Content-Type', 'image/webp');
        break;
      default:
        res.setHeader('Content-Type', 'application/octet-stream');
    }
  },
  fallthrough: false,
  index: false
}));

// Middleware для обслуживания статических файлов из корневой директории (для временных файлов)
app.use((req, res, next) => {
  // Только для файлов изображений в корне и НЕ для API запросов
  if (req.url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i) && !req.url.startsWith('/api/')) {
    try {
      req.url = decodeURIComponent(req.url);
    } catch (error) {
      console.error('Root URL decode error:', error);
    }
    
    // Используем express.static только для изображений
    express.static(process.cwd(), {
      setHeaders: (res, filePath) => {
        // Добавляем CORS заголовки для изображений
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Range');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        
        // Устанавливаем правильный Content-Type для изображений
        const ext = path.extname(filePath).toLowerCase();
        switch (ext) {
          case '.png':
            res.setHeader('Content-Type', 'image/png');
            break;
          case '.jpg':
          case '.jpeg':
            res.setHeader('Content-Type', 'image/jpeg');
            break;
          case '.gif':
            res.setHeader('Content-Type', 'image/gif');
            break;
          case '.svg':
            res.setHeader('Content-Type', 'image/svg+xml');
            break;
          case '.webp':
            res.setHeader('Content-Type', 'image/webp');
            break;
          default:
            res.setHeader('Content-Type', 'application/octet-stream');
        }
      },
      fallthrough: true,
      index: false,
      dotfiles: 'ignore'
    })(req, res, next);
  } else {
    next();
  }
});

// Middleware для логирования всех запросов
app.use((req, res, next) => {
  console.log(`MAIN SERVER REQUEST: ${req.method} ${req.url}`);
  next();
});

// Обработчик ошибок для статических файлов
app.use((err: any, req: any, res: any, next: any) => {
  if (req.url.includes('/uploads/') || req.url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
    console.error('Static file error:', {
      url: req.url,
      method: req.method,
      error: err.message
    });
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.status(404).json({ 
      success: false, 
      message: 'File not found',
      url: req.url 
    });
    return;
  }
  next(err);
});

// Middleware для обработки ошибок
app.use((err: any, req: any, res: any, next: any) => {
  console.error('ERROR:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
