# DesignMyLife - Installation & Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [AI Configuration](#ai-configuration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** v14 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **MongoDB Atlas** account ([Sign up](https://www.mongodb.com/cloud/atlas/register))
- **Git** ([Download](https://git-scm.com/))

### Optional but Recommended
- **AI API Key** from Anthropic or OpenAI
  - Anthropic: https://console.anthropic.com/
  - OpenAI: https://platform.openai.com/api-keys

## Backend Setup

### Step 1: Extract Backend Files
```bash
unzip designmylife-backend-ai.zip
cd server
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- Express.js
- MongoDB/Mongoose
- Authentication (bcrypt, JWT)
- File handling (multer, archiver)
- AI integration (axios)

### Step 3: Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` file with your values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/designmylife?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_very_secure_random_jwt_secret_key_here

# AI Configuration (Optional)
AI_PROVIDER=anthropic
AI_API_KEY=your_anthropic_api_key_here
AI_MODEL=claude-3-5-sonnet-20241022
AI_TIMEOUT=30000
AI_MAX_RETRIES=2
```

### Step 4: Get MongoDB Connection String

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (free tier available)
3. Click "Connect" → "Connect your application"
4. Copy connection string
5. Replace `<password>` with your database password
6. Replace `<username>` with your database username
7. Paste into `MONGO_URI` in `.env`

### Step 5: Generate JWT Secret

Generate a secure random string:

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Using OpenSSL:**
```bash
openssl rand -hex 64
```

Copy the output and paste into `JWT_SECRET` in `.env`

## Frontend Setup

### Step 1: Extract Frontend Files
```bash
unzip designmylife-frontend-ai.zip
cd client
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- React & React Router
- Tailwind CSS
- Axios for API calls
- UI components

### Step 3: Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

**For production:**
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## AI Configuration

### Option 1: Anthropic Claude (Recommended)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up / Log in
3. Go to "API Keys" section
4. Create a new API key
5. Copy the key

In `server/.env`:
```env
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-api03-xxx...
AI_MODEL=claude-3-5-sonnet-20241022
```

### Option 2: OpenAI GPT

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up / Log in
3. Navigate to API keys
4. Create a new secret key
5. Copy the key

In `server/.env`:
```env
AI_PROVIDER=openai
AI_API_KEY=sk-proj-xxx...
AI_MODEL=gpt-4
```

### Disable AI Features

To run without AI:
```env
# Simply don't set AI_API_KEY
# or comment it out:
# AI_API_KEY=
```

The app will work with fallback responses.

## Running the Application

### Start Backend

```bash
cd server
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║   DesignMyLife Server Running          ║
║   Port: 5000                           ║
║   Environment: development             ║
╚════════════════════════════════════════╝

MongoDB Connected: cluster0.mongodb.net
```

### Start Frontend

In a new terminal:
```bash
cd client
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### Access the Application

1. Open browser to: `http://localhost:3000`
2. You'll see the login page
3. Click "Sign up" to create an account

## Verify Installation

### 1. Check Backend Health
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "DesignMyLife API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Check AI Status
```bash
curl http://localhost:5000/api/ai/status
```

With AI configured:
```json
{
  "available": true,
  "provider": "anthropic",
  "features": {
    "goalDecomposition": true,
    "behaviorAnalysis": true,
    "planningOptimization": true,
    "reflectionAnalysis": true
  }
}
```

Without AI:
```json
{
  "available": false,
  "message": "AI features are disabled. Set AI_API_KEY to enable."
}
```

### 3. Test Registration

1. Go to `http://localhost:3000/register`
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Create Account"
4. You should be redirected to dashboard

## Troubleshooting

### Backend Issues

#### Error: "Cannot connect to MongoDB"
**Solution:**
1. Check `MONGO_URI` is correct in `.env`
2. Verify MongoDB Atlas IP whitelist (add `0.0.0.0/0` for testing)
3. Check database username/password are correct

#### Error: "Port 5000 already in use"
**Solution:**
1. Change PORT in `.env` to another port (e.g., 5001)
2. Update frontend `.env` to match new port

#### Error: "JWT_SECRET is not defined"
**Solution:**
1. Ensure `.env` file exists in `server/` directory
2. Check `JWT_SECRET` is set in `.env`
3. Restart the server

### Frontend Issues

#### Error: "Network Error" when calling API
**Solution:**
1. Check backend is running on port 5000
2. Verify `VITE_API_URL` in frontend `.env`
3. Check CORS settings in backend

#### Error: "Module not found"
**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### AI Issues

#### AI features not working
**Solution:**
1. Check `AI_API_KEY` is set in backend `.env`
2. Verify API key is valid at provider console
3. Check `/api/ai/status` endpoint
4. Review server logs for errors

#### Timeout errors
**Solution:**
1. Increase `AI_TIMEOUT` in `.env` (e.g., `60000` for 60 seconds)
2. Check internet connectivity
3. Verify provider API status

## Production Deployment

### Backend

1. Set `NODE_ENV=production` in `.env`
2. Generate strong `JWT_SECRET`
3. Set production `MONGO_URI`
4. Configure `AI_API_KEY`
5. Deploy to:
   - Heroku
   - Railway
   - Render
   - AWS/GCP/Azure

### Frontend

1. Build production bundle:
   ```bash
   npm run build
   ```
2. Deploy `dist/` folder to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages

### Environment Variables for Production

Backend:
```env
PORT=5000
MONGO_URI=mongodb+srv://prod-user:xxx@cluster.mongodb.net/designmylife
JWT_SECRET=<64-character-random-hex>
NODE_ENV=production
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-api03-xxx
```

Frontend:
```env
VITE_API_URL=https://api.yourapp.com/api
```

## Next Steps

1. **Create your first goal** - Test the goal decomposition AI
2. **Add some habits** - Track daily consistency
3. **Create tasks** - Plan your week
4. **Use AI features** - Get intelligent insights
5. **Check analytics** - View your progress

## Support

For issues:
1. Check server logs: `server/` terminal
2. Check browser console: F12 Developer Tools
3. Review this guide's troubleshooting section
4. Check MongoDB Atlas dashboard
5. Verify AI provider status page

## Resources

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
