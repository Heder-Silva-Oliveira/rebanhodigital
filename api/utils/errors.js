export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const Errors = {
  BAD_REQUEST: (msg = 'Requisição inválida') =>
    new AppError(msg, 400),

  UNAUTHORIZED: (msg = 'Não autorizado') =>
    new AppError(msg, 401),

  FORBIDDEN: (msg = 'Acesso negado') =>
    new AppError(msg, 403),

  NOT_FOUND: (msg = 'Recurso não encontrado') =>
    new AppError(msg, 404),

  CONFLICT: (msg = 'Conflito de dados') =>
    new AppError(msg, 409),

  INTERNAL: (msg = 'Erro interno do servidor') =>
    new AppError(msg, 500),
};
