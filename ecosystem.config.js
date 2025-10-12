module.exports = {
  apps: [{
    name: 'caturnawa-tes',
    script: 'npm',
    args: 'start -- -p 8008',
    cwd: '/root/work/caturnawa2025',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8008
    },
    error_file: '/var/log/pm2/caturnawa-tes-error.log',
    out_file: '/var/log/pm2/caturnawa-tes-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}

