class ApiError extends Error {
  constructor(
    statusCode,
    message = "An error occurred while processing your request.",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, ApiError);
      //   Error.captureStackTrace(this, this.constructor);
    }
  }
}
export { ApiError };
