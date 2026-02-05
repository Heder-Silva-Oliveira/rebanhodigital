import Joi from 'joi';

// Validação para registro
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Nome deve conter apenas letras e espaços',
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres'
    }),
    
  email: Joi.string()
    .email()
    .max(255)
    .lowercase()
    .required()
    .messages({
      'string.email': 'Email deve ter um formato válido'
    }),
    
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
      'string.min': 'Senha deve ter pelo menos 8 caracteres'
    }),
    
  phone: Joi.string()
    .pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Telefone deve estar no formato (XX) XXXXX-XXXX'
    }),
    
  role: Joi.string()
    .valid('operador', 'admin')
    .default('operador'),
    
  plan: Joi.string()
    .valid('basic', 'pro', 'enterprise')
    .default('basic')
});

// Validação para login
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),
    
  password: Joi.string()
    .min(1)
    .required()
});

// Validação para mudança de senha
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required(),
    
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'
    })
});

// Validação para reset de senha
export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required(),
    
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
});

// Validação para forgot password
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
});