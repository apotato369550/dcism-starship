/**
 * PM2 Ecosystem Configuration File
 *
 * Usage:
 *   Production:   pm2 start ecosystem.config.js --env production
 *   Development:  pm2 start ecosystem.config.js --env development
 *
 * Documentation: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    {
      name: 'starship',
      script: 'server/index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 20145,
      },
      // Restart settings
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      // Logging
      output: '/var/log/starship/out.log',
      error: '/var/log/starship/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Process management
      ignore_watch: ['node_modules', '.git', 'tests'],
      watch: false, // Set to true for auto-restart on file changes
      env_watch: ['server'],
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000,
    },
  ],

  // Deploy configuration (optional, for PM2 Deploy)
  deploy: {
    production: {
      user: 's21103565',
      host: 'web.dcism.org',
      port: 22077,
      ref: 'origin/main',
      repo: 'https://github.com/apotato369550/dcism-starship.git',
      path: '/home/s21103565/starship.dcism.org',
      'post-deploy': 'npm install --production && pm2 restart all --env production',
      'pre-deploy-local': 'echo "Pre-deploy tasks..."',
    },
  },
};
