# Clerk Authentication 422 Error - Troubleshooting Guide

## Error Details
**Error**: `POST https://fitting-ringtail-60.clerk.accounts.dev/v1/client/sign_ins 422 (Unprocessable Content)`

**What this means**: Clerk is rejecting the sign-in request because the authentication method being used is not properly configured.

---

## Solution: Enable Authentication Methods in Clerk Dashboard

### Step 1: Access Your Clerk Dashboard
1. Go to: https://dashboard.clerk.com
2. Select your application: **"fitting-ringtail-60"**
3. Or direct link: https://dashboard.clerk.com/apps/app_34YsVSz9DMV2VLnBx2bzNrTCBWe

### Step 2: Enable Email & Password Authentication

1. In the left sidebar, click **"User & Authentication"**
2. Click on **"Email, Phone, Username"**
3. Make sure these are enabled:
   - ✅ **Email address** - Toggle ON
   - ✅ **Require email address** - Toggle ON (optional)
   - ✅ **Verification** - Set to "Email code" or "Email link"

4. Scroll down to **"Password"** section:
   - ✅ **Password** - Toggle ON
   - ✅ **Require password** - Toggle ON

5. Click **"Save"** at the bottom

### Step 3: Alternative - Enable Social Login (Optional)

If you prefer social login instead:

1. In the left sidebar, click **"User & Authentication"**
2. Click on **"Social Connections"**
3. Enable one or more providers:
   - ✅ Google
   - ✅ GitHub
   - ✅ Microsoft
   - etc.

4. Click **"Save"**

---

## Verification Steps

After enabling authentication methods:

1. **Refresh your browser** (clear cache if needed)
2. Go to `/auth` page
3. You should now see:
   - Email/Password fields (if email auth enabled)
   - Social login buttons (if social auth enabled)

---

## Common Issues & Solutions

### Issue 1: "Development instance limit reached"
**Symptom**: Same 422 error even after enabling auth methods

**Solution**: 
- Development instances have usage limits
- Upgrade to a production instance in Clerk Dashboard
- OR create a new development instance

### Issue 2: "Sign-in button not showing"
**Symptom**: No way to sign in on the auth page

**Solution**:
- Make sure at least ONE authentication method is enabled
- Check browser console for Clerk initialization errors
- Verify `VITE_CLERK_PUBLISHABLE_KEY` in `.env` is correct

### Issue 3: "Redirect not working after sign-in"
**Symptom**: Signs in but stays on auth page

**Solution**:
- Check `afterSignInUrl` in `main.tsx` is set to `/dashboard`
- Verify `ProtectedRoute` component is working correctly

---

## Your Current Configuration

**Frontend (.env)**:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Zml0dGluZy1yaW5ndGFpbC02MC5jbGVyay5hY2NvdW50cy5kZXYk
```

**Backend (.env)**:
```
CLERK_PUBLISHABLE_KEY=pk_test_Zml0dGluZy1yaW5ndGFpbC02MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_reaUIWMEYCjKLnJ3AWDqGgJamLqGU0L6FsKeyg93rv
```

**Clerk Instance**: 
- Name: `fitting-ringtail-60`
- Domain: `fitting-ringtail-60.clerk.accounts.dev`
- Environment: Development

---

## Quick Test

To verify Clerk is working properly, try this test:

1. Open browser DevTools → Console
2. Run:
```javascript
window.Clerk.isReady()
```

Should return `true` if Clerk loaded correctly.

---

## Need More Help?

If the issue persists after following these steps:

1. Check Clerk status page: https://status.clerk.com/
2. Review Clerk docs: https://clerk.com/docs/quickstarts/react
3. Contact Clerk support with:
   - Instance ID: `ins_34YsVSz9DMV2VLnBx2bzNrTCBWe`
   - Error: 422 on sign-in attempt
   - Timestamp of error

---

## Alternative: Test Without Login (For Development Only)

If you just want to test the application functionality without dealing with Clerk authentication right now, the public job pages should work without login:

- ✅ `/jobs` - Public job listings (no auth needed)
- ✅ `/jobs/:id` - Public job details (no auth needed)
- ❌ `/dashboard/*` - Requires authentication

---

## Summary

**Most likely fix**: Go to Clerk Dashboard → Enable "Email address" + "Password" authentication → Save → Refresh browser

Let me know if you need help with any of these steps!
