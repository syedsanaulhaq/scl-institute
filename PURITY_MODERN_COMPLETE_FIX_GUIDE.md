# Purity Modern Theme - Complete Troubleshooting Guide

## 🎨 How to See the Purity Colors (Step-by-Step)

Your theme files are correct and installed. Follow these steps to see the Purity design:

---

## Method 1: Admin Panel Cache Clear (MOST RELIABLE) ✅

### Step 1: Clear Theme Caches
1. Open Moodle: **http://localhost:9090**
2. Click on your **Admin** profile (top right)
3. Navigate to: **Admin → Development**
4. Click button: **"Purge all caches"**
5. Wait for message: "Caches cleared"

### Step 2: Browser Cache Clear
1. Press **Ctrl+Shift+Delete** on your keyboard
2. Select "Cached Images and Files"
3. Click "Clear"
4. Close the tab

### Step 3: Hard Refresh
1. Go back to Moodle
2. Press **Ctrl+F5** (or Cmd+Shift+R on Mac)
3. Wait for page to load

### What You'll See:
✅ **Dark Blue Navbar** (#172b4d) at top - "Mount Orange"  
✅ **Indigo Buttons** (#5e72e4) - submit/action buttons  
✅ **Light Gray Background** (#f8f9fe) - clean, modern look  
✅ **White Cards** with professional shadows  
✅ **Open Sans Typography** - clean fonts  

---

## Method 2: Switch Theme & Back (Alternative)

1. **Admin → Appearance → Themes**
2. Click **"Boost"** → "Select theme"
3. Wait a few seconds
4. Go back: **Admin → Appearance → Themes**
5. Click **"Purity Modern"** → "Select theme"
6. Purge caches (see Method 1 above)

---

## Method 3: Direct CLI (For Advanced Users)

```bash
# In WSL terminal:
wsl cd /var/www/moodle-9090
wsl php admin/cli/purge_caches.php
```

After running, refresh browser (Ctrl+F5).

---

## 🎯 If You STILL Don't See Colors

### Check 1: Verify Theme is Selected
- **Admin → Appearance → Themes**
- Look for section: **"Current theme"**
- Should show: **"Purity Modern"** with checkmark
- If not: Click "Select theme 'Purity Modern'"

### Check 2: Verify Files Installed
- **Admin → Maintenance → Dev tools**
- Or open browser console: **F12 → Console**
- Look for any errors about purity_modern theme

### Check 3: Check Browser Console
- Press **F12** in browser
- Click **Console** tab
- Look for any red errors
- Screenshot any errors found

### Check 4: Try Different Browser
- Open **Mozilla Firefox** or **Chrome** (if using Edge)
- Visit http://localhost:9090
- Sometimes browser extension caching causes issues

---

## 🔍 Theme File Verification

If colors still don't show, verify files are in place:

### On Windows (Check WSL files):
```powershell
wsl ls -la /var/www/moodle-9090/theme/purity_modern/
```

Should show:
- ✅ version.php
- ✅ config.php  
- ✅ lib.php
- ✅ settings.php
- ✅ scss/ folder
- ✅ layout/ folder

---

## 📝 What We Changed

### Files Updated:
1. **lib.php** - SCSS compilation (Boost + Purity styles)
2. **custom.scss** - Color definitions (indigo, dark blue, light gray)
3. **All layout files** - Proper Moodle 4.x rendering
4. **version.php** - Moodle 4.x compatibility

### Color Codes Applied:
- Primary: `#5e72e4` (Indigo)
- Secondary: `#172b4d` (Dark Blue)
- Background: `#f8f9fe` (Light Gray)

### All colors have `!important` flags to override Boost defaults

---

## 🆘 Still Having Issues?

### Last Resort: Full Fresh Install

```bash
# In WSL:
wsl sudo rm -rf /var/www/moodle-9090/theme/purity_modern
wsl cp -r '/mnt/e/SCL-Projects/purity-modern' '/var/www/moodle-9090/theme/purity_modern'
wsl sudo chown -R www-data:www-data /var/www/moodle-9090/theme/purity_modern
```

Then:
1. Clear theme caches (follow Method 1 above)
2. Browser hard refresh (Ctrl+F5)

---

## ✅ Success Indicators

You'll know it's working when you see:

**Visual Changes:**
- [x] Navbar turns dark blue (#172b4d)
- [x] All buttons turn indigo (#5e72e4)  
- [x] Background becomes light gray (#f8f9fe)
- [x] Cards have subtle shadows
- [x] Typography is cleaner (Open Sans)
- [x] Links are indigo colored

**Theme Selector Page Shows:**
- Purity Modern section with "Current theme" label
- Preview shows indigo buttons (if preview works)

---

## 📞 Quick Checklist

Before reporting issue, verify:
- [ ] You cleared ALL caches (admin panel)
- [ ] You cleared browser cache (Ctrl+Shift+Delete)
- [ ] You did hard refresh (Ctrl+F5)
- [ ] You waited 10+ seconds after cache clear
- [ ] You checked in different browser
- [ ] Files exist in `/var/www/moodle-9090/theme/purity_modern/`
- [ ] Theme shows as "Current theme" in admin panel

---

**Theme Status**: ✅ Installed and Ready  
**Color Codes**: ✅ Applied with !important flags  
**Files**: ✅ All in correct location  
**Next Step**: Follow Method 1 above to see the colors!
