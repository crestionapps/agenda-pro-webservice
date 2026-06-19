export class AppError extends Error {
  constructor(public statusCode: number, message: string) { super(message); }
}
export class NotFoundError extends AppError {
  constructor(r: string) { super(404, `${r} não encontrado(a)`); }
}
export class ConflictError extends AppError {
  constructor(message: string) { super(409, message); }
}
export class UnauthorizedError extends AppError {
  constructor(m = 'Não autorizado') { super(401, m); }
}
export class ForbiddenError extends AppError {
  constructor(m = 'Acesso negado') { super(403, m); }
}
export class ValidationError extends AppError {
  constructor(message: string) { super(400, message); }
}
