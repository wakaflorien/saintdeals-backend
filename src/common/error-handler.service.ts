import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

export interface ErrorHandlerOptions {
  operation?: string; // e.g., 'creating category', 'retrieving users'
  knownExceptions?: any[]; // Array of exception types to re-throw
  prismaErrorMap?: Record<string, string>; // Custom Prisma error messages
}

@Injectable()
export class ErrorHandlerService {
  private readonly logger = new Logger(ErrorHandlerService.name);

  /**
   * Centralized error handler for consistent error processing
   */
  handleError(error: unknown, options: ErrorHandlerOptions = {}): never {
    const {
      operation = 'processing request',
      knownExceptions = [
        ConflictException,
        BadRequestException,
        NotFoundException,
      ],
      prismaErrorMap = {},
    } = options;

    // Re-throw known exceptions as-is
    if (this.isKnownException(error, knownExceptions)) {
      throw error;
    }

    // Handle Prisma-specific errors
    if (this.isPrismaError(error)) {
      const prismaError = error as { code: string; meta?: any };
      const customMessage = prismaErrorMap[prismaError.code];

      if (customMessage) {
        throw new BadRequestException(customMessage);
      }

      // Handle common Prisma errors
      switch (prismaError.code) {
        case 'P2002': {
          // Unique constraint violation
          const target = (prismaError.meta as { target?: string[] })?.target;
          const field = target?.[0] as string;
          const fieldName = field ? ` (${field})` : '';
          throw new ConflictException(
            `A record with this information already exists${fieldName}`,
          );
        }

        case 'P2025': // Record not found
          throw new BadRequestException('The requested record was not found');

        case 'P2003': // Foreign key constraint violation
          throw new BadRequestException(
            'Cannot perform this operation due to related data',
          );

        case 'P1001': // Database connection error
          this.logger.error(
            `Database connection error during ${operation}:`,
            error,
          );
          throw new InternalServerErrorException(
            'Database connection failed. Please try again later.',
          );

        case 'P2024': // Timed out fetching a new connection from the connection pool
          this.logger.error(`Database timeout during ${operation}:`, error);
          throw new InternalServerErrorException(
            'Database operation timed out. Please try again.',
          );

        default:
          this.logger.error(`Unknown Prisma error during ${operation}:`, error);
          throw new InternalServerErrorException(
            `An unexpected database error occurred while ${operation}. Please try again.`,
          );
      }
    }

    // Handle network errors
    if (this.isNetworkError(error)) {
      this.logger.error(`Network error during ${operation}:`, error);
      throw new InternalServerErrorException(
        'Network connection failed. Please try again later.',
      );
    }

    // Handle validation errors (from class-validator)
    if (this.isValidationError(error)) {
      throw new BadRequestException('Invalid data provided');
    }

    // Log and throw generic error for unexpected cases
    this.logger.error(`Unexpected error during ${operation}:`, error);
    throw new InternalServerErrorException(
      `An unexpected error occurred while ${operation}. Please try again.`,
    );
  }

  /**
   * Check if error is a known exception type
   */
  private isKnownException(error: unknown, knownExceptions: any[]): boolean {
    return knownExceptions.some(
      (exceptionType) => error instanceof exceptionType,
    );
  }

  /**
   * Check if error is a Prisma error
   */
  private isPrismaError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    if (!('code' in error)) {
      return false;
    }

    const code = (error as { code: unknown }).code;
    return typeof code === 'string' && code.startsWith('P');
  }

  /**
   * Check if error is a network-related error
   */
  private isNetworkError(error: unknown): boolean {
    if (!(error && typeof error === 'object' && 'message' in error)) {
      return false;
    }

    const errorMessage = (error as Error).message;
    return (
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ECONNRESET') ||
      errorMessage.includes('ETIMEDOUT') ||
      errorMessage.includes('ECONNABORTED')
    );
  }

  /**
   * Check if error is a validation error
   */
  private isValidationError(error: unknown): boolean {
    return !!(
      error &&
      typeof error === 'object' &&
      'name' in error &&
      (error as { name: unknown }).name === 'ValidationError'
    );
  }
}
