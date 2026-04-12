const dotenv = require('dotenv');
const path = require('path');

// 加载 .env 文件
dotenv.config({ path: path.join(__dirname, '.env') });

module.exports = {
  apps: [
    {
      name: 'verify-card',
      script: './.next/standalone/server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
};
