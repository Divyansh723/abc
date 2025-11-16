# Security Best Practices

## Environment Variables Protection

### ✅ What We've Implemented

1. **Safe Logging**
   - Created `server/src/utils/logger.js` with functions to mask sensitive data
   - Removed direct logging of MongoDB connection strings
   - Removed environment variable dumps from console

2. **Git Protection**
   - Updated `.gitignore` to exclude all `.env` files
   - Both root and server `.env` files are ignored

3. **Code Changes**
   - `server/src/config/database.js`: Removed MongoDB host logging
   - `src/services/habitService.ts`: Removed environment variable logging
   - `server/src/server.js`: Using safe logger for startup messages

### 🔒 Environment Variables to Protect

**Backend (server/.env):**
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `GEMINI_API_KEY` - AI service API key
- Any other API keys or secrets

**Frontend (.env):**
- `VITE_API_BASE_URL` - API endpoint (less sensitive but good to hide)
- `VITE_GEMINI_API_KEY` - If used on frontend (should be avoided)

### 📋 Checklist for Production

- [ ] All `.env` files are in `.gitignore`
- [ ] No secrets are hardcoded in source code
- [ ] No console.log statements expose sensitive data
- [ ] Environment variables are set in production environment (not in code)
- [ ] Use environment-specific `.env` files (.env.production, .env.development)
- [ ] Rotate secrets regularly
- [ ] Use different secrets for development and production

### 🛡️ Additional Security Measures

#### 1. Use Environment-Specific Files

```bash
# Development
.env.development

# Production
.env.production

# Testing
.env.test
```

#### 2. Never Commit Secrets

```bash
# Check for accidentally committed secrets
git log -p | grep -i "mongodb_uri\|jwt_secret\|api_key"

# Remove from history if found (dangerous - backup first!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

#### 3. Use Secret Management Services

For production, consider:
- **AWS Secrets Manager**
- **Azure Key Vault**
- **Google Cloud Secret Manager**
- **HashiCorp Vault**
- **Doppler**
- **1Password for Teams**

#### 4. Validate Environment Variables

Add validation on startup:

```javascript
// server/src/config/validateEnv.js
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

export const validateEnv = () => {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
};
```

#### 5. Use .env.example Files

Create template files without actual secrets:

```bash
# .env.example
MONGODB_URI=mongodb://localhost:27017/habitforge
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
GEMINI_API_KEY=your-api-key-here
PORT=8000
NODE_ENV=development
```

### 🚨 What NOT to Do

❌ **Never do this:**
```javascript
// BAD - Exposes secrets
console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('JWT Secret:', process.env.JWT_SECRET);

// BAD - Hardcoded secrets
const API_KEY = 'sk-1234567890abcdef';

// BAD - Secrets in error messages
throw new Error(`Failed to connect with URI: ${process.env.MONGODB_URI}`);

// BAD - Secrets in API responses
res.json({ config: process.env });
```

✅ **Do this instead:**
```javascript
// GOOD - Safe logging
console.log('MongoDB:', process.env.MONGODB_URI ? 'Connected' : 'Not configured');

// GOOD - Use environment variables
const API_KEY = process.env.API_KEY;

// GOOD - Generic error messages
throw new Error('Failed to connect to database');

// GOOD - Only send necessary data
res.json({ status: 'ok', environment: process.env.NODE_ENV });
```

### 🔍 Audit Your Code

Run these commands to check for potential issues:

```bash
# Search for potential secret leaks
grep -r "console.log.*process.env" .
grep -r "console.log.*MONGODB" .
grep -r "console.log.*JWT" .
grep -r "console.log.*API_KEY" .

# Check for hardcoded secrets (look for suspicious patterns)
grep -r "mongodb+srv://" . --exclude-dir=node_modules
grep -r "sk-[a-zA-Z0-9]" . --exclude-dir=node_modules
```

### 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [12 Factor App - Config](https://12factor.net/config)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

### 🔄 Regular Maintenance

1. **Rotate secrets every 90 days**
2. **Audit access logs monthly**
3. **Review environment variables quarterly**
4. **Update dependencies regularly**
5. **Monitor for security vulnerabilities**

### 🆘 If Secrets Are Exposed

1. **Immediately rotate all exposed secrets**
2. **Check access logs for unauthorized access**
3. **Notify affected users if data was compromised**
4. **Review and update security practices**
5. **Consider using secret scanning tools**

## Current Status

✅ Environment variables are now protected from logging
✅ .gitignore is configured to exclude .env files
✅ Safe logging utility is implemented
✅ No sensitive data in console output

## Next Steps

1. Review all console.log statements in the codebase
2. Implement environment variable validation
3. Create .env.example files for both frontend and backend
4. Set up secret rotation schedule
5. Consider using a secret management service for production
