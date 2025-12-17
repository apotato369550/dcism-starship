# Deployment Guide: DCISM Starship

This guide explains how to deploy the DCISM Starship game to your production server.

## Prerequisites

### On Your Local Machine
- SSH client
- Terminal/Command line access

### On Your Production Server (web.dcism.org)
- Node.js (v14+)
- npm
- PM2 installed globally: `npm install -g pm2`
- SSH access configured
- Port 20145 available and accessible

## One-Time Setup: SSH Key Authentication

For security, we'll use SSH key authentication instead of passwords.

### 1. Generate SSH Key (if you don't have one)
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter for all prompts to use defaults
```

### 2. Add Your Public Key to the Server
```bash
ssh-copy-id -p 22077 s21103565@web.dcism.org
# Enter your password when prompted
# Only do this once!
```

### 3. Verify Key-Based Access
```bash
ssh -p 22077 s21103565@web.dcism.org "echo 'SSH access successful!'"
# Should NOT ask for password
```

## Manual Deployment Steps

### Step 1: SSH into the Server
```bash
ssh -p 22077 s21103565@web.dcism.org
```

### Step 2: Navigate to Deployment Folder
```bash
cd ~
mkdir -p starship.dcism.org
cd starship.dcism.org
```

### Step 3: Clone or Pull Repository
**First time deployment:**
```bash
git clone https://github.com/apotato369550/dcism-starship.git .
```

**Subsequent deployments (pull latest):**
```bash
git pull origin main
```

### Step 4: Install Dependencies
```bash
npm install --production
```

### Step 5: Create or Update .env File
```bash
nano .env
```

Add or update the following:
```
# Map Settings
MAP_WIDTH=20
MAP_HEIGHT=20

# Player Starting Values
STARTING_ENERGY=10
STARTING_ENERGY_PER_SEC=0

# Timing (in milliseconds)
COOLDOWN_MS=3000
ECONOMY_TICK_MS=1000

# Tile Defaults
BASE_TILE_DEFENSE=1
BASE_TILE_MAX_DEFENSE=1

# Server
PORT=20145
```

Save with `Ctrl+X` then `Y` then `Enter`.

### Step 6: Stop Any Existing PM2 Processes
```bash
pm2 stop starship 2>/dev/null || true
pm2 delete starship 2>/dev/null || true
```

### Step 7: Start the Application with PM2
```bash
pm2 start "npm start" --name starship
pm2 save
```

### Step 8: Exit Server and Access Your Game
```bash
exit
```

Navigate to: `http://starship.dcism.org:20145`

## Managing the Application

### SSH into Your Server
```bash
ssh -p 22077 s21103565@web.dcism.org
```

### View Running Processes
```bash
pm2 list
```

### View Live Logs
```bash
pm2 logs starship
```

### View Last 100 Lines of Logs
```bash
pm2 logs starship --lines 100
```

### Stop the Application
```bash
pm2 stop starship
```

### Restart the Application
```bash
pm2 restart starship
```

### View Process Details
```bash
pm2 show starship
```

### Delete from PM2 Management
```bash
pm2 delete starship
```

## Updating to Latest Code

To deploy updates:

```bash
ssh -p 22077 s21103565@web.dcism.org
cd ~/starship.dcism.org
git pull origin main
npm install --production
pm2 restart starship
exit
```

## Troubleshooting

### SSH Connection Failed
- Verify SSH key is added to server: `ssh -p 22077 s21103565@web.dcism.org "ls -la .ssh"`
- Check port is correct: 22077
- Verify username: s21103565

### Application Won't Start
Check logs:
```bash
ssh -p 22077 s21103565@web.dcism.org "pm2 logs starship"
```

Common issues:
- Port already in use: Change PORT in .env
- Missing dependencies: Run `npm install --production` on server
- Node.js version too old: Upgrade Node.js on server

### Port Already in Use
If port 20145 is in use:

```bash
ssh -p 22077 s21103565@web.dcism.org
# Find what's using port 20145
sudo lsof -i :20145
# Kill the process if needed
sudo kill <PID>
```

## Environment Variables

The `.env` file on your server controls game behavior:

- `PORT` - Server port (set to 20145)
- `MAP_WIDTH` - Game grid width (default: 20)
- `MAP_HEIGHT` - Game grid height (default: 20)
- `STARTING_ENERGY` - Initial player energy (default: 10)
- `STARTING_ENERGY_PER_SEC` - Energy generation rate (default: 0)
- `COOLDOWN_MS` - Action cooldown in milliseconds (default: 3000)
- `ECONOMY_TICK_MS` - Economy loop interval (default: 1000)
- `BASE_TILE_DEFENSE` - Base tile defense value (default: 1)
- `BASE_TILE_MAX_DEFENSE` - Base tile max defense (default: 1)

To modify environment variables on the server:

```bash
ssh -p 22077 s21103565@web.dcism.org
cd starship.dcism.org
nano .env
# Edit values as needed, save with Ctrl+X then Y
pm2 restart starship
```

## PM2 Startup on Server Reboot

To ensure the game restarts automatically if the server reboots:

```bash
ssh -p 22077 s21103565@web.dcism.org
pm2 startup
# Follow the instructions it prints
pm2 save
```

## Monitoring

### Check Memory Usage
```bash
ssh -p 22077 s21103565@web.dcism.org "pm2 monit"
```

### View Process Status
```bash
ssh -p 22077 s21103565@web.dcism.org "pm2 status"
```

### Check Disk Space
```bash
ssh -p 22077 s21103565@web.dcism.org "df -h"
```

## Backup

Before deploying major updates, consider backing up your game data:

```bash
ssh -p 22077 s21103565@web.dcism.org
cd starship.dcism.org
tar -czf backup-$(date +%Y%m%d).tar.gz .
```

## References

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [SSH Key Authentication](https://www.ssh.com/academy/ssh/public-key-authentication)

## Support

For issues or questions:
1. Check logs: `pm2 logs starship`
2. Verify environment variables: `cat .env`
3. Restart the process: `pm2 restart starship`
4. Check PM2 guide: `pm2 guide`
