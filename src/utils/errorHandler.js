class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message || 'Error interno del servidor'
    });
  };
  
  module.exports = { AppError, errorHandler };