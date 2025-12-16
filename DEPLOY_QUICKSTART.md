# Quick Start: Deploy to DCISM Server

## 🚀 Fast Path (5 minutes)

### 1. Set Up SSH Key (One-time only)
```bash
# Generate key if you don't have one
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to server
ssh-copy-id -p 22077 s21103565@web.dcism.org
```

### 2. Deploy
```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 3. Access Your Game
```
http://starship.dcism.org:20145
```

## 📋 What the Script Does

✅ Connects to your server via SSH
✅ Clones or updates the repository
✅ Installs dependencies
✅ Configures port to 20145
✅ Starts app with PM2
✅ Enables auto-restart on reboot

## 🔧 Common Commands

**View logs:**
```bash
ssh -p 22077 s21103565@web.dcism.org "pm2 logs starship"
```

**Restart app:**
```bash
ssh -p 22077 s21103565@web.dcism.org "pm2 restart starship"
```

**Stop app:**
```bash
ssh -p 22077 s21103565@web.dcism.org "pm2 stop starship"
```

**Check status:**
```bash
ssh -p 22077 s21103565@web.dcism.org "pm2 status"
```

## 📚 Full Documentation

See `DEPLOYMENT.md` for detailed instructions, troubleshooting, and advanced options.

## ⚠️ Troubleshooting

**SSH connection failed?**
- Verify key is on server: `ssh -p 22077 s21103565@web.dcism.org "ls .ssh"`
- Check port 22077 is correct
- Try with password: `ssh -p 22077 -oPasswordAuthentication=yes s21103565@web.dcism.org`

**App won't start?**
```bash
ssh -p 22077 s21103565@web.dcism.org
cd starship.dcism.org
pm2 logs starship --lines 50  # View recent errors
```

**Manual setup alternative:**
```bash
ssh -p 22077 s21103565@web.dcism.org
cd starship.dcism.org
git clone https://github.com/apotato369550/dcism-starship.git . 2>/dev/null || git pull
npm install --production
echo "PORT=20145" >> .env
pm2 start "npm start" --name starship
pm2 save
```

## 🔄 Redeploying Updates

Just run `./deploy.sh` again - it will pull the latest code and restart.

---

For detailed information, see **DEPLOYMENT.md**
