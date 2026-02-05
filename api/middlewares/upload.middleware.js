import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Lista de MIME types permitidos
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

// Lista de extensões permitidas
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Função para verificar se o arquivo é realmente uma imagem
const isValidImageFile = (buffer) => {
  // Verificação de magic numbers (assinaturas de arquivo)
  const signatures = {
    jpg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    gif: [0x47, 0x49, 0x46],
    webp: [0x52, 0x49, 0x46, 0x46]
  };

  for (const [type, signature] of Object.entries(signatures)) {
    if (signature.every((byte, index) => buffer[index] === byte)) {
      return true;
    }
  }
  return false;
};

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: { 
    fileSize: 2 * 1024 * 1024, // 2MB (reduzido de 5MB)
    files: 1 // Apenas 1 arquivo por vez
  },
  fileFilter: (req, file, cb) => {
    try {
      // Verificar MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error('Tipo de arquivo não permitido. Apenas imagens são aceitas.'), false);
      }

      // Verificar extensão do arquivo
      const ext = path.extname(file.originalname).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new Error('Extensão de arquivo não permitida.'), false);
      }

      // Sanitizar nome do arquivo
      const sanitizedName = file.originalname
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Remove caracteres especiais
        .substring(0, 100); // Limita o tamanho do nome

      file.originalname = sanitizedName;

      cb(null, true);
    } catch (error) {
      cb(new Error('Erro ao processar arquivo'), false);
    }
  },
});

// Middleware adicional para validação de conteúdo
export const validateImageContent = (req, res, next) => {
  if (req.file && req.file.buffer) {
    if (!isValidImageFile(req.file.buffer)) {
      return res.status(400).json({
        error: 'Arquivo não é uma imagem válida'
      });
    }
  }
  next();
};

// Rate limiting específico para upload
// import rateLimit from 'express-rate-limit';

// export const uploadLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 5, // máximo 5 uploads por IP
//   message: {
//     error: 'Muitos uploads. Tente novamente em 15 minutos.'
//   }
// });