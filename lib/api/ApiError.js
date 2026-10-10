// Thrown from the db layer (or a route) when a failure should become a
// specific HTTP status: 400 bad input, 403 wrong role, 404 not found,
// 409 conflict. Anything else that throws becomes a 500.
export class ApiError extends Error {
  constructor(message, status = 500, extra = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    Object.assign(this, extra);
  }
}
