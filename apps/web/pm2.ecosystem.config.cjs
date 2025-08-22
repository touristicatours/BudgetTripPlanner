module.exports = {
  apps: [
    {
      name: 'tripweaver',
      script: 'npm',
      args: 'run start:prod',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },
      // PM2 will auto-restart on crash
      max_memory_restart: '300M',
      watch: false,
      kill_timeout: 5000,
    },
  ],
};


