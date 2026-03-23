/**
 * ApiResponse — Frontend response wrapper class
 * 
 * Normalizes Axios success responses into a clean shape
 * matching your backend's ApiResponse format: { statusCode, data, message, success }
 * 
 * Usage:
 *   const response = ApiResponse.from(axiosResponse);
 *   console.log(response.data);       // the actual payload (user, room, etc.)
 *   console.log(response.message);    // "User registered successfully"
 *   console.log(response.success);    // true
 */

class ApiResponse {
  constructor({ statusCode = 200, data = null, message = "SUCCESS", success = true }) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success;
  }

  /**
   * Factory method — creates an ApiResponse from an Axios response
   * Handles both your backend's { statusCode, data, message } shape
   * and any unexpected response formats gracefully
   */
  static from(axiosResponse) {
    // Already an ApiResponse — return as-is
    if (axiosResponse instanceof ApiResponse) {
      return axiosResponse;
    }

    const resData = axiosResponse?.data;

    // Your backend returns: { statusCode, data, message }
    if (resData && typeof resData === "object") {
      return new ApiResponse({
        statusCode: resData.statusCode || axiosResponse?.status || 200,
        data: resData.data !== undefined ? resData.data : resData,
        message: resData.message || "SUCCESS",
        success: resData.statusCode ? resData.statusCode < 400 : true,
      });
    }

    // Fallback for unexpected response formats
    return new ApiResponse({
      statusCode: axiosResponse?.status || 200,
      data: resData,
      message: "SUCCESS",
      success: true,
    });
  }

  /**
   * String representation for logging
   */
  toString() {
    return `[ApiResponse ${this.statusCode}] ${this.message}`;
  }
}

export default ApiResponse;
