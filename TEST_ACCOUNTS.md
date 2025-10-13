# 🔐 Test Account Credentials

This document contains the login credentials for test accounts in the Caturnawa 2025 development environment.

**⚠️ IMPORTANT: These are test accounts for development/testing purposes only!**

---

## 📋 Available Test Accounts

### 1. Admin Account
- **Email:** `admin@test.com`
- **Password:** `admin123`
- **Role:** `admin`
- **Access:**
  - Full admin dashboard access
  - Participant management
  - Competition management
  - Judge assignment
  - Payment verification
  - Tournament bracket generation
  - Comprehensive results viewing

### 2. Judge Account
- **Email:** `judge@test.com`
- **Password:** `judge123`
- **Role:** `judge`
- **Access:**
  - Judge dashboard
  - Scoring interface for assigned competitions
  - View participant submissions
  - Submit scores for:
    - KDBI/EDC debate matches
    - SPC submissions (semifinal & final)
    - DCC submissions (semifinal, short video, final)

### 3. Participant Account
- **Email:** `participant@test.com`
- **Password:** `participant123`
- **Role:** `participant`
- **Access:**
  - Participant dashboard
  - Competition registration
  - Payment proof upload
  - Document upload
  - Work submission (for SPC/DCC)
  - View registration status
  - View competition results
- **Profile Details:**
  - Full Name: Participant Test
  - Institution: Test University
  - Faculty: Test Faculty
  - Student ID: TEST123456
  - WhatsApp: 081234567890

---

## 🌐 Login URL

**Development Site:** https://tes.caturnawa.tams.my.id/auth/signin

---

## 🔧 How to Use

1. Navigate to the login page: https://tes.caturnawa.tams.my.id/auth/signin
2. Enter the email and password for the role you want to test
3. Click "Sign In"
4. You will be redirected to the appropriate dashboard based on your role

---

## 🛠️ Technical Details

### Password Hashing
- All passwords are hashed using **bcryptjs** with **12 salt rounds**
- Passwords are never stored in plain text in the database

### Database Seeding
Test accounts are created via the Prisma seed script:

```bash
npm run db:seed
```

This script:
1. Creates the three test user accounts (if they don't exist)
2. Hashes passwords using bcrypt
3. Marks emails as verified for immediate testing
4. Creates a participant profile for the participant account
5. Creates all competition data (KDBI, EDC, SPC, DCC)
6. Creates debate rounds for KDBI and EDC

### Verification Script
To verify test accounts exist in the database:

```bash
npx tsx scripts/verify-test-users.ts
```

---

## 🔄 Re-running the Seed

If you need to recreate the test accounts:

```bash
# Option 1: Run seed only (safe - won't delete existing data)
npm run db:seed

# Option 2: Reset database and re-seed (⚠️ DESTRUCTIVE - deletes all data)
npm run db:reset
```

**Note:** The seed script uses `upsert` for competitions and checks for existing users, so running `npm run db:seed` multiple times is safe.

---

## 📝 Testing Scenarios

### Admin Testing
1. Login as admin
2. Navigate to `/dashboard/admin`
3. Test participant verification
4. Test tournament bracket generation
5. Test comprehensive results viewing

### Judge Testing
1. Login as judge
2. Navigate to `/dashboard/judge`
3. Test scoring interface for different competitions
4. Test submission viewing and evaluation

### Participant Testing
1. Login as participant
2. Navigate to `/dashboard`
3. Test competition registration flow
4. Test payment proof upload
5. Test document upload
6. Test work submission (SPC/DCC)

---

## 🔒 Security Notes

- ✅ All passwords are properly hashed with bcrypt
- ✅ Email verification is enabled for test accounts
- ✅ Accounts follow the same authentication flow as production
- ⚠️ **DO NOT** use these credentials in production
- ⚠️ **DO NOT** commit this file to public repositories
- ⚠️ Change all test passwords before deploying to production

---

## 📊 Database Schema

Test accounts are stored in the following tables:

- **users** - Main user account (email, password, role)
- **Participant** - Participant profile (only for participant role)

### User Model Fields
```typescript
{
  id: string (cuid)
  email: string (unique)
  password: string (hashed)
  name: string
  role: UserRole (admin | judge | participant)
  emailVerified: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 🎯 Next Steps

After logging in with test accounts, you can:

1. **Test the new Discord-style design** we just implemented
2. **Verify all dashboard features** work correctly
3. **Test the registration flow** end-to-end
4. **Test the scoring system** for judges
5. **Test the admin panel** functionality

---

## 📞 Support

If you encounter any issues with test accounts:

1. Check the database connection in `.env`
2. Verify the seed script ran successfully
3. Run the verification script to confirm accounts exist
4. Check the application logs for authentication errors

---

**Last Updated:** 2025-10-13  
**Created By:** Database Seed Script  
**Environment:** Development (tes.caturnawa.tams.my.id)

