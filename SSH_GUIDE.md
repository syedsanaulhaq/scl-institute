# 🔐 SSH Connection Guide - Server Access

## Your Server Details

| Item | Value |
|------|-------|
| **Server IP** | 185.211.6.60 |
| **Default User** | root |
| **SSH Port** | 22 (default) |
| **Domain** | sclsandbox.xyz |

---

## 🖥️ Connect via SSH

### Option 1: Using SSH (Terminal)

```bash
ssh root@185.211.6.60
```

If SSH key is needed:

```bash
ssh -i /path/to/your/private/key root@185.211.6.60
```

If using a custom port (e.g., port 2222):

```bash
ssh -p 2222 root@185.211.6.60
```

---

### Option 2: Using Windows (PowerShell)

```powershell
# Built-in SSH (Windows 10+)
ssh root@185.211.6.60

# Or with key file
ssh -i C:\path\to\key root@185.211.6.60
```

---

### Option 3: Using PuTTY (Windows GUI)

1. Download PuTTY: https://www.putty.org/
2. Open PuTTY
3. Enter:
   - **Host Name**: 185.211.6.60
   - **Port**: 22
   - **Connection type**: SSH
4. Click **Open**
5. Login as: `root`

---

### Option 4: Using VS Code Remote SSH

1. Install **Remote - SSH** extension in VS Code
2. In VS Code: `Ctrl+Shift+P` → "Remote-SSH: Connect to Host"
3. Enter: `root@185.211.6.60`
4. Select "Linux"
5. VS Code will connect and show file explorer

---

## ✅ First Time Connection

**You may see:**

```
The authenticity of host '185.211.6.60 (185.211.6.60)' can't be established.
ECDSA key fingerprint is SHA256:xxxxx
Are you sure you want to continue connecting (yes/no)?
```

**Type `yes` and press Enter**

This adds the server to your `known_hosts` file.

---

## 🔍 Quick Server Health Check

Once connected via SSH:

```bash
# Run health check
wget https://raw.githubusercontent.com/syedsanaulhaq/scl-institute/main/scripts/server-health-check.sh -O /tmp/health-check.sh && \
chmod +x /tmp/health-check.sh && \
bash /tmp/health-check.sh
```

---

## 📂 Common SSH Commands

Once logged in:

```bash
# Check current directory
pwd

# List files
ls -la

# Go to project directory
cd /opt/scl-institute

# Check Docker containers
docker ps

# View recent logs
docker-compose -f docker-compose.prod.yml logs --tail 50

# Check system info
uname -a

# Check disk usage
df -h

# Check RAM usage
free -h

# Exit SSH
exit
```

---

## 🔧 Troubleshooting SSH Connection

### Connection refused
```bash
# Check if server is online
ping 185.211.6.60
```

### Permission denied
- Check SSH key permissions: `chmod 600 /path/to/key`
- Verify server accepts SSH (port 22 might be blocked by firewall)

### Cannot find host
- Verify IP: 185.211.6.60
- Check internet connection
- Check if firewall allows port 22

### Too many authentication failures
```bash
# Limit to key authentication only
ssh -o PubkeyAuthentication=only -i /path/to/key root@185.211.6.60
```

---

## 🎯 Once Connected

### Step 1: Check Server Status
```bash
bash /tmp/health-check.sh
```

### Step 2: View Project Files
```bash
cd /opt/scl-institute
ls -la
```

### Step 3: Check Running Services
```bash
docker ps
```

### Step 4: View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 5: Monitor Services
```bash
docker stats
```

---

## 📋 SSH Key Setup (If Using Keys)

### If you don't have an SSH key:

**On your local machine:**
```bash
ssh-keygen -t ed25519 -f ~/.ssh/scl-institute -C "scl@institute"
```

**Then copy public key to server:**
```bash
ssh-copy-id -i ~/.ssh/scl-institute.pub root@185.211.6.60
```

Or manually:
1. Copy the contents of `~/.ssh/scl-institute.pub`
2. SSH to server
3. Add to `~/.ssh/authorized_keys`

---

## 🔏 Security Tips

1. **Never share your SSH key**
2. **Use strong passwords**
3. **Consider disabling password auth** (use keys only)
4. **Limit SSH access** with firewall rules
5. **Monitor logs** for unauthorized access: `sudo tail -f /var/log/auth.log`

---

## 🆘 Need Help?

If you can't connect:

1. Verify server is running: `ping 185.211.6.60`
2. Check firewall allows port 22
3. Verify correct username (usually `root`)
4. Check SSH key permissions
5. Contact your hosting provider if server is unreachable

---

## Next Steps

✅ **Once connected successfully:**

1. Run health check: `bash /tmp/health-check.sh`
2. Check server logs: `docker-compose -f docker-compose.prod.yml logs`
3. Update DNS records
4. Test services at domain URLs
5. Setup SSL certificates (optional)

---

**You should now be able to connect to your server via SSH!** 🚀
