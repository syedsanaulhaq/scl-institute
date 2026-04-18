# 🚨 EMERGENCY PRESENTATION TROUBLESHOOTING

**If something goes wrong during your presentation, use this guide.**

---

## PROBLEM 1: System Won't Start

**What you see:** Nothing loads when you open http://localhost:3000

**SOLUTION (2 minutes):**

1. Open PowerShell
2. Run:
```powershell
docker-compose down
docker-compose up -d
```
3. Wait 60 seconds
4. Try http://localhost:3000 again

**If it still doesn't work:**
```powershell
docker ps
```
Show the output. If all containers say "Up", wait another 30 seconds then refresh browser.

---

## PROBLEM 2: "Cannot connect to database"

**What you see:** Error message about database connection

**SOLUTION (1 minute):**

```powershell
docker restart scli-mysql
```

Wait 30 seconds, then refresh your browser.

---

## PROBLEM 3: Page loads but says "No applications found"

**What you see:** Dashboard works but Admissions Hub shows 0 applications

**SOLUTION (1 minute):**

1. Click the blue "Refresh" button on the dashboard
2. Wait 5 seconds
3. Should show 10 applications

**If still 0:**
```powershell
docker restart scli-backend
```
Wait 30 seconds, refresh browser.

---

## PROBLEM 4: Page is slow / won't load quickly

**What you see:** Dashboard takes 10+ seconds to load or times out

**SOLUTION (30 seconds):**

1. Press F5 to refresh browser
2. Press F5 again if it's still slow
3. Try opening a new browser tab and going to http://localhost:3000 again

**If still slow:**
```powershell
docker restart
```
Wait 60 seconds.

---

## PROBLEM 5: Login doesn't work

**What you see:** "Invalid credentials" or error on login screen

**SOLUTION (1 minute):**

Check EXACT spelling:
- Email: `admin@sclsandbox.xyz`
- Password: `password123`

Make sure:
- No extra spaces before/after
- Exact capitalization
- No copy-paste issues

If still doesn't work:
```powershell
docker restart scli-backend
```

---

## PROBLEM 6: Completely frozen / nothing works

**NUCLEAR OPTION (restart everything):**

```powershell
docker-compose down
docker-compose up -d
```

Wait 60 seconds. Everything should work again.

**This is safe.** It just restarts containers, doesn't delete data.

---

## PROBLEM 7: Docker says "command not found"

**What you see:** PowerShell says docker is not recognized

**SOLUTION:**

Docker Desktop isn't running. 
1. Open Docker Desktop app
2. Wait 30 seconds for it to start
3. Try your command again

---

## PROBLEM 8: "Port 3000 already in use"

**What you see:** Error about port 3000 being in use

**SOLUTION:**

Something else is using port 3000.

```powershell
netstat -ano | findstr :3000
```

This shows what's using it. Or just:

```powershell
docker-compose restart scli-frontend
```

---

## PROBLEM 9: Page loads but nothing displays

**What you see:** Dashboard page renders but all content is blank

**SOLUTION:**

1. Press F5 (refresh)
2. Wait 10 seconds
3. Press F5 again if still blank

If content still blank:
```powershell
docker logs scli-backend | tail -50
```

Look for any error messages.

---

## PROBLEM 10: "It says there are 0 courses"

**What you see:** Course Lifecycle shows "Found 0 courses"

**SOLUTION:**

Same as Problem 3. Click blue "Refresh" button.

If still 0:
```powershell
docker restart scli-backend
docker restart scli-mysql
```

---

## IF NOTHING HERE WORKS

### Quick checklist:
- [ ] Docker Desktop is open?
- [ ] All 5 containers showing when you run `docker ps`?
- [ ] You're at http://localhost:3000 (not http://127.0.0.1:3000)?
- [ ] Browser tab is refreshed (F5)?
- [ ] You waited 60+ seconds after starting containers?

### Nuclear Reset:
```powershell
cd "c:\SCL System\scl-institute"
docker-compose down
docker volume prune
docker-compose up -d
```

Wait 90 seconds. This should fix anything.

---

## DURING PRESENTATION: What to say

If something goes wrong in front of stakeholders:

**"One moment, let me restart the system..."**

Then run:
```powershell
docker-compose restart
```

Wait 60 seconds and smile. Everyone understands technical issues happen.

---

## KEY COMMANDS (Copy/Paste Ready)

**Check all containers:**
```powershell
docker ps
```

**Restart everything:**
```powershell
docker-compose restart
```

**Restart one container:**
```powershell
docker restart scli-backend
docker restart scli-frontend
docker restart scli-mysql
docker restart scli-nginx
```

**Go to project directory:**
```powershell
cd "c:\SCL System\scl-institute"
```

**See backend logs:**
```powershell
docker logs scli-backend
```

**See frontend logs:**
```powershell
docker logs scli-frontend
```

**Stop everything:**
```powershell
docker-compose down
```

**Start everything:**
```powershell
docker-compose up -d
```

---

## REMEMBER

- 99% of issues are fixed by: `docker-compose restart`
- 99% of those are fixed in less than 60 seconds
- Your data is NEVER lost (it's in Docker volumes)
- You can restart as many times as you want without losing anything

**You've got this.** ✅

---

## BEFORE YOUR PRESENTATION

Read this section:
1. PROBLEM 1: System Won't Start
2. PROBLEM 6: Completely frozen / nothing works

Know those two solutions by heart. That's all you need.

Everything else is optional backup.

---

**Last resort:** If you're 5 minutes away from presenting and nothing works:

```powershell
cd "c:\SCL System\scl-institute"
powershell -ExecutionPolicy Bypass -File VERIFY_AND_START_SYSTEM.ps1
```

Run that. It fixes almost everything and tells you when the system is ready.

Good luck! 🍀
