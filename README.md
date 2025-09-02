# UNAS FEST 2025 - Caturnawa Registration System

Sistem registrasi kompetisi untuk UNAS FEST 2025 yang memungkinkan peserta mendaftar untuk berbagai kompetisi seperti KDBI, EDC, SPC, dan lainnya.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js
- **File Upload**: Multer + Cloud Storage
- **Deployment**: Self-hosted VPS

## Fitur Utama

- Multi-step registration form
- Competition-specific forms (KDBI, EDC, SPC, Infografis, Short Video)
- File upload untuk dokumen pendukung
- Payment proof upload
- Admin dashboard untuk verifikasi
- Invoice generation dengan watermark
- Responsive design

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── register/          # Registration flow
├── components/            # Reusable components
│   ├── registration/      # Registration components
│   └── ui/               # UI components
├── lib/                   # Utilities & configs
└── types/                 # TypeScript types
```

## Setup Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database and auth configs

# Database setup
npm run db:generate
npm run db:migrate
npm run db:seed

# Run development server
npm run dev
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/caturnawa"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
```

## Database Schema

- **User**: Basic user info & role
- **Participant**: Detailed participant profile
- **Competition**: Competition details & pricing
- **Registration**: Team registrations & status
- **RegistrationFile**: Uploaded documents

## Registration Flow

1. **Competition Selection** - Pilih kompetisi
2. **Team Information** - Isi data tim/anggota
3. **Document Upload** - Upload dokumen pendukung
4. **Payment** - Konfirmasi pembayaran
5. **Success** - Generate invoice & redirect

## Deployment ke VPS

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

### 2. Database Setup
```bash
# Create database user
sudo -u postgres createuser --interactive caturnawa_user
sudo -u postgres createdb caturnawa_db

# Set password
sudo -u postgres psql
ALTER USER caturnawa_user PASSWORD 'your_password';
\q
```

### 3. Application Deployment
```bash
# Clone repository
git clone <your-repo> /var/www/caturnawa
cd /var/www/caturnawa

# Install dependencies
npm install

# Build application
npm run build

# Setup environment
cp .env.example .env
# Edit .env with production values

# Database migration
npm run db:migrate

# Start with PM2
pm2 start npm --name "caturnawa" -- start
pm2 save
pm2 startup
```

### 4. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/caturnawa/uploads;
    }
}
```

### 5. SSL Setup (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Maintenance

```bash
# Update application
cd /var/www/caturnawa
git pull origin main
npm install
npm run build
pm2 restart caturnawa

# Database backup
pg_dump -U caturnawa_user caturnawa_db > backup_$(date +%Y%m%d).sql

# Log monitoring
pm2 logs caturnawa
tail -f /var/log/nginx/access.log
```

## Troubleshooting

- **Port 3000 already in use**: `sudo lsof -i :3000` then kill process
- **Database connection failed**: Check PostgreSQL service & credentials
- **File upload errors**: Verify upload directory permissions
- **PM2 not starting**: Check logs with `pm2 logs`

---

**Dibuat oleh Tim Department IT UNAS FEST 2025** 

