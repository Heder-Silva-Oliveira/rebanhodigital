export const requestLogger = (req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
};