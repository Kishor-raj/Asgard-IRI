const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack || err.message}`);

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    const maxMb = process.env.MAX_FILE_SIZE_MB || 5;
    return res.status(400).json({
      success: false,
      error: `File too large. Maximum size is ${maxMb} MB.`,
    });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error.';
  res.status(status).json({ success: false, error: message });
};

module.exports = { errorHandler };
