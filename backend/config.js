// Production Configuration
module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_key_change_this_in_production',
  DB: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_mysql_password_here',
    database: process.env.DB_NAME || 'memorywall'
  },
  EMAIL: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  },
  NODE_ENV: process.env.NODE_ENV || 'development'
}; 