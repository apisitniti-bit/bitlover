export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export const createError = (message: string, statusCode: number = 500): ApiError => {
  return new ApiError(message, statusCode);
};
