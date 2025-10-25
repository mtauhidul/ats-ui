# Clerk Authentication Setup Guide

This guide will walk you through setting up Clerk authentication for YTFCS ATS with invitation-only access and role-based access control (RBAC).

## 📋 Prerequisites

- Clerk account (free tier works great)
- YTFCS ATS application running locally

## 🚀 Step-by-Step Setup

### 1. Create Clerk Application

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Click **"+ Create Application"**
3. Name it: **"YTFCS ATS"**
4. Choose authentication methods:
   - ✅ Email + Password
   - ✅ Email verification code (passwordless)
   - ✅ Google (optional)
   - ✅ Microsoft (optional for enterprise)
5. Click **"Create Application"**

### 2. Get Your Publishable Key

1. After creation, you'll see your keys
2. Copy the **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Update your `.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

4. Restart your dev server for changes to take effect

### 3. Configure Invitation-Only Mode

**This is the KEY security feature!**

1. In Clerk Dashboard, go to **"User & Authentication"** → **"Email, Phone, Username"**
2. Scroll to **"Sign-up mode"**
3. Select: **"Restricted"**
   - This disables public sign-ups
   - Users can ONLY join via admin invitation
4. Click **"Save"**

### 4. Configure Email Verification

1. In Clerk Dashboard, go to **"Email, Phone, Username"**
2. Under **"Email address"**:
   - ✅ Enable **"Verify at sign-up"**
   - ✅ Enable **"Verify after update"**
3. Click **"Save"**

### 5. Set Up User Roles (RBAC)

#### Create Custom Metadata Schema:

1. Go to **"User & Authentication"** → **"Metadata"**
2. Add to **Public Metadata** schema:

```json
{
  "role": {
    "type": "string",
    "enum": ["admin", "recruiter", "hiring_manager", "viewer"]
  }
}
```

3. Click **"Save"**

### 6. Configure Session Settings

1. Go to **"Sessions"** in sidebar
2. Configure:
   - **Session lifetime**: 7 days
   - **Inactivity timeout**: 1 day
   - ✅ Enable **"Multi-session handling"**
   - ✅ Enable **"Device tracking"**
3. Click **"Save"**

### 7. Customize Authentication UI (Optional)

1. Go to **"Customization"** → **"Theme"**
2. Match your brand:
   - Primary color: Your brand color
   - Font: Your app font
   - Logo: Upload your logo
3. Go to **"Pages"** → **"Sign In"**
4. Customize messaging if needed

### 8. Configure Production Domain (When Deploying)

1. Go to **"Domains"**
2. Add your production domain: `yourdomain.com`
3. Update `.env` with production keys

## 👥 Inviting Team Members

### Option 1: Via Clerk Dashboard (Recommended for First Users)

1. Go to **"Users"** in Clerk Dashboard
2. Click **"+ Create User"**
3. Fill in details:
   - Email address
   - First name
   - Last name
4. Click **"Create"**
5. User will receive welcome email with account activation link
6. After user is created, click on the user
7. Go to **"Metadata"** tab
8. Under **"Public metadata"**, add:
```json
{
  "role": "admin"
}
```
9. Click **"Save"**

### Option 2: Via Invitations API (Programmatic)

1. Go to **"API Keys"** in Clerk Dashboard
2. Copy your **Secret Key** (keep this SECURE!)
3. In your admin panel, use the invitation API:

```typescript
// Example: Admin creates invitation
const response = await fetch('https://api.clerk.com/v1/invitations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email_address: 'newuser@company.com',
    public_metadata: {
      role: 'recruiter'
    },
    redirect_url: 'https://yourapp.com/dashboard'
  })
})
```

## 🔐 Security Best Practices

### 1. Enable Multi-Factor Authentication (MFA)

1. Go to **"User & Authentication"** → **"Multi-factor"**
2. Enable:
   - ✅ Authenticator app (TOTP)
   - ✅ SMS code (optional)
   - ✅ Backup codes
3. Require MFA for:
   - ✅ Admin role (highly recommended)
   - Optional for other roles

### 2. Set Up Allowlist (Optional)

If you only want specific domains:

1. Go to **"User & Authentication"** → **"Restrictions"**
2. Add to **"Allowed email domains"**:
   ```
   @yourcompany.com
   @yourdomain.com
   ```
3. Click **"Save"**

### 3. Configure Rate Limiting

1. Go to **"Attack Protection"**
2. Enable:
   - ✅ Rate limiting
   - ✅ CAPTCHA after failed attempts
   - ✅ Bot detection

### 4. Enable Audit Logs (Pro Plan)

Track all authentication events for compliance.

## 🎯 Role Assignment Workflow

### Initial Admin Setup:

1. **Create first admin user** via Clerk Dashboard
2. **Set role to admin** in public metadata
3. **Admin logs in** to YTFCS ATS
4. **Admin can now invite** other team members

### Adding New Team Members:

```typescript
// In your admin panel UI (future implementation)
async function inviteTeamMember(email: string, role: UserRole) {
  const response = await fetch('/api/invitations', {
    method: 'POST',
    body: JSON.stringify({ email, role })
  })
  
  // Backend creates Clerk invitation with role in metadata
}
```

## 📊 Understanding the Role System

### Role Hierarchy:

```
admin
├── Full system access
├── User management
└── Settings control

recruiter
├── Manage clients
├── Manage jobs
├── Manage candidates
└── Review applications

hiring_manager
├── View candidates
├── Review applications
└── Schedule interviews

viewer
└── Read-only access to all data
```

### Permission Matrix:

| Action | Admin | Recruiter | Hiring Manager | Viewer |
|--------|-------|-----------|----------------|--------|
| Create Jobs | ✅ | ✅ | ❌ | ❌ |
| Edit Jobs | ✅ | ✅ | ❌ | ❌ |
| View Candidates | ✅ | ✅ | ✅ | ✅ |
| Approve Applications | ✅ | ✅ | ✅ | ❌ |
| Manage Team | ✅ | ❌ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

## 🛠️ Testing Your Setup

### 1. Test Public Access (Should Be Blocked)

1. Open incognito window
2. Try to visit `/dashboard`
3. You should be redirected to `/auth`

### 2. Test Sign-Up Prevention

1. Go to `/auth`
2. Try to create a new account
3. Should show message: "Contact administrator"

### 3. Test Invitation Flow

1. Create invitation via Clerk Dashboard
2. Check email inbox
3. Click activation link
4. Verify user can access dashboard
5. Verify role permissions work correctly

## 🔧 Troubleshooting

### Issue: "Missing Publishable Key" Error

**Solution**: 
- Check `.env` file has correct key
- Key should start with `pk_test_` or `pk_live_`
- Restart dev server after changing `.env`

### Issue: Users Can Still Sign Up Publicly

**Solution**:
- Go to Clerk Dashboard → Email, Phone, Username
- Ensure "Sign-up mode" is set to "Restricted"
- Clear browser cache and test again

### Issue: Roles Not Working

**Solution**:
- Verify metadata schema is set in Clerk Dashboard
- Check user's public metadata has `role` field
- Log out and log back in to refresh token

### Issue: Email Verification Not Sending

**Solution**:
- Check Clerk Dashboard → Email & Phone
- Verify email verification is enabled
- Check spam folder
- Contact Clerk support if issue persists

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React SDK](https://clerk.com/docs/references/react/overview)
- [RBAC Best Practices](https://clerk.com/docs/authentication/rbac)
- [Security Guide](https://clerk.com/docs/security/overview)

## 🆘 Support

If you encounter issues:

1. Check this guide first
2. Review Clerk documentation
3. Check browser console for errors
4. Contact Clerk support (very responsive!)
5. Reach out to dev team

## ✅ Setup Checklist

Before going live, ensure:

- [ ] Clerk application created
- [ ] Publishable key added to `.env`
- [ ] Invitation-only mode enabled
- [ ] Email verification enabled
- [ ] Metadata schema configured
- [ ] First admin user created
- [ ] Admin role assigned to first user
- [ ] Rate limiting enabled
- [ ] MFA enabled for admins
- [ ] Production domain configured
- [ ] All team members invited
- [ ] Permission system tested
- [ ] Session settings configured

---

**Security Note**: Never commit your `.env` file or share your Secret Key. Keep all credentials secure.
