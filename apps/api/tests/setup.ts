process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/chat-app-test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? 'test-jwt-secret-which-is-long-enough-123456';
process.env.REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ?? 'test-refresh-secret-which-is-long-enough-123456';
