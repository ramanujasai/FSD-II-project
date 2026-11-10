export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (
    typeof secret !== 'string' ||
    secret.length < 32 ||
    /change.?me|replace.?with|demo_super_secret/i.test(secret)
  ) {
    throw new Error('JWT_SECRET must be configured with a unique random value of at least 32 characters.');
  }

  return secret;
};

export const validateRuntimeConfig = () => {
  getJwtSecret();

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI must be configured in production.');
    }
    if (!process.env.CLIENT_URL) {
      throw new Error('CLIENT_URL must contain the allowed frontend origin(s) in production.');
    }
  }
};
