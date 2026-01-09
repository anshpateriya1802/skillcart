
## 1. System Preparation

Update the system and install essential build tools.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl wget git unzip

```

## 2. Runtimes (Node & Bun)

### Install Node via NVM

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts

```

### Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

```

## 3. Process Management (PM2)

Install PM2 globally to keep your apps running 24/7.

```bash
npm install -g pm2

```

| Command | Description |
| --- | --- |
| `pm2 start bun -- name "api" -- index.ts` | Start Bun backend |
| `pm2 start bun -- name "web" -- run dev` | Start Vite frontend |
| `pm2 status` | Check all running apps |
| `pm2 logs` | View real-time logs |
| `pm2 save && pm2 startup` | Ensure apps start on server reboot |

## 4. Firewall & Nginx

Open the necessary ports and install Nginx.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

sudo apt install -y nginx

```

## 5. Optimized Nginx Configuration

This configuration handles both your **Frontend (5173)** and **Backend (3000)** on separate subdomains.

**Edit file:** `sudo nano /etc/nginx/nginx.conf` (Replace everything with the code below)

```nginx
events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    # 1. FRONTEND: skillcert.surajv.dev
    server {
        listen 80;
        server_name skillcert.surajv.dev;

        location / {
            proxy_pass http://localhost:5173;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # 2. BACKEND: api.surajv.dev
    server {
        listen 80;
        server_name api.surajv.dev;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}

```

**Test and Reload:**

```bash
sudo nginx -t
sudo systemctl reload nginx

```

## 6. SSL Security (Certbot)

Automate HTTPS for both subdomains.

```bash
sudo apt install -y python3-certbot-nginx
sudo certbot --nginx -d skillcert.surajv.dev -d api.surajv.dev

```

*Follow the prompts to redirect all traffic to HTTPS.*

## 7. Vite Configuration (vite.config.ts)

Ensure Vite allows the proxy requests.

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // Critical for VM access
    port: 5173,
    allowedHosts: ['skillcert.surajv.dev']
  }
})

```

---

### One-Click Project Start Example

If you are inside your project folder:

```bash
# Start Backend
pm2 start bun --name backend -- index.ts

# Start Frontend
pm2 start bun --name frontend -- run dev

# Save everything for reboots
pm2 save

```
