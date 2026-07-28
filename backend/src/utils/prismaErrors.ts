import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/client';

export interface FormattedPrismaError {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export const isPrismaError = (error: unknown): boolean => {
  return (
    error instanceof PrismaClientKnownRequestError ||
    error instanceof PrismaClientUnknownRequestError ||
    error instanceof PrismaClientRustPanicError ||
    error instanceof PrismaClientInitializationError ||
    error instanceof PrismaClientValidationError
  );
};

export const formatPrismaError = (error: unknown): FormattedPrismaError => {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target = (error.meta?.target as string[]) || [];
        const fieldStr = target.length > 0 ? target.join(', ') : 'field';
        return {
          statusCode: 409,
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          message: `A record with this ${fieldStr} already exists.`,
          details: { target: error.meta?.target },
        };
      }
      case 'P2003': {
        const fieldName = (error.meta?.field_name as string) || 'foreign key';
        return {
          statusCode: 409,
          code: 'FOREIGN_KEY_CONSTRAINT_VIOLATION',
          message: `Invalid reference on ${fieldName}.`,
          details: { fieldName },
        };
      }
      case 'P2025': {
        const cause = (error.meta?.cause as string) || 'Record not found';
        return {
          statusCode: 404,
          code: 'RECORD_NOT_FOUND',
          message: cause,
        };
      }
      case 'P2000': {
        return {
          statusCode: 400,
          code: 'VALUE_TOO_LONG',
          message: 'Provided value is too long for column constraint.',
        };
      }
      default: {
        return {
          statusCode: 400,
          code: `PRISMA_KNOWN_ERROR_${error.code}`,
          message: error.message || 'Database request error.',
        };
      }
    }
  }

  if (error instanceof PrismaClientValidationError) {
    return {
      statusCode: 400,
      code: 'PRISMA_VALIDATION_ERROR',
      message: 'Invalid database query or schema validation error.',
    };
  }

  if (error instanceof PrismaClientInitializationError) {
    return {
      statusCode: 503,
      code: 'DATABASE_INITIALIZATION_ERROR',
      message: 'Failed to initialize database connection.',
    };
  }

  return {
    statusCode: 500,
    code: 'INTERNAL_DATABASE_ERROR',
    message: 'An unexpected database error occurred.',
  };
};
