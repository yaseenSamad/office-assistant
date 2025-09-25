const successResponse = (res, message = "Success", data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    statusCode,
    message,
    data,
  });
};

const errorResponse = (res, error, statusCode = 500) => {
  return res.status(statusCode).json({
    statusCode,
    message: "Error",
    error: error instanceof Error ? error.message : error,
  });
};

module.exports = { successResponse, errorResponse };
