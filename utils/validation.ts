/**
 * Input Validation Utility
 * Validates and sanitizes user inputs for API endpoints
 */

export interface ValidationError {
  field: string;
  message: string;
}

export class Validator {
  private errors: ValidationError[] = [];

  /**
   * Validate required string field
   */
  requireString(
    value: unknown,
    field: string,
    minLength = 1,
    maxLength = 500
  ): boolean {
    if (typeof value !== "string") {
      this.errors.push({ field, message: `${field} must be a string` });
      return false;
    }

    if (value.trim().length < minLength) {
      this.errors.push({
        field,
        message: `${field} must be at least ${minLength} characters`,
      });
      return false;
    }

    if (value.length > maxLength) {
      this.errors.push({
        field,
        message: `${field} must be at most ${maxLength} characters`,
      });
      return false;
    }

    return true;
  }

  /**
   * Validate required UUID field
   */
  requireUUID(value: unknown, field: string): boolean {
    if (typeof value !== "string") {
      this.errors.push({ field, message: `${field} must be a string` });
      return false;
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      this.errors.push({ field, message: `${field} must be a valid UUID` });
      return false;
    }

    return true;
  }

  /**
   * Validate subject field (preset values)
   */
  requireSubject(value: unknown): boolean {
    const validSubjects = ["java", "dbms", "os", "python"];
    if (!validSubjects.includes(value as string)) {
      this.errors.push({
        field: "subject",
        message: `subject must be one of: ${validSubjects.join(", ")}`,
      });
      return false;
    }
    return true;
  }

  /**
   * Validate correct_option field
   */
  requireOption(value: unknown, field: string = "correct_option"): boolean {
    const validOptions = ["A", "B", "C", "D"];
    if (!validOptions.includes(value as string)) {
      this.errors.push({
        field,
        message: `${field} must be one of: ${validOptions.join(", ")}`,
      });
      return false;
    }
    return true;
  }

  /**
   * Validate optional string field
   */
  optionalString(
    value: unknown,
    field: string,
    maxLength = 2000
  ): boolean {
    if (value === undefined || value === null) return true;

    if (typeof value !== "string") {
      this.errors.push({ field, message: `${field} must be a string` });
      return false;
    }

    if (value.length > maxLength) {
      this.errors.push({
        field,
        message: `${field} must be at most ${maxLength} characters`,
      });
      return false;
    }

    return true;
  }

  /**
   * Get all validation errors
   */
  getErrors(): ValidationError[] {
    return this.errors;
  }

  /**
   * Check if validation passed
   */
  isValid(): boolean {
    return this.errors.length === 0;
  }

  /**
   * Format errors as error message
   */
  formatError(): string {
    if (this.isValid()) return "";
    return this.errors.map((e) => `${e.field}: ${e.message}`).join("; ");
  }
}

/**
 * Sanitize string input
 */
export function sanitizeString(str: string): string {
  return str.trim().slice(0, 500);
}

/**
 * Sanitize subject input
 */
export function sanitizeSubject(subject: string): string {
  const validSubjects = ["java", "dbms", "os", "python"];
  const normalized = subject.toLowerCase().trim();
  return validSubjects.includes(normalized) ? normalized : "";
}
