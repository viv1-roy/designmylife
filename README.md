# DesignMyLife — Life OS Web Platform with AI

A full-stack productivity and life-planning web platform with **AI-powered decision support** that helps users design their goals, habits, and daily workflows as an interconnected system.

This application goes beyond traditional productivity apps by introducing a **Life Architecture Engine**, **Life Simulation Mode**, and **AI Planning Assistant**, allowing users to plan intentionally and preview projected progress with intelligent recommendations.

## 🚀 Vision

Most productivity apps only track tasks or habits.

DesignMyLife treats life as a **system**, where:

- Goals → influence habits  
- Habits → shape daily actions  
- Actions → generate analytics  
- Analytics → improve planning  
- **AI → optimizes decisions**

The result is an AI-enhanced, feedback-driven life design system.

## 🤖 AI Features (NEW!)

### 1. Goal Decomposition
Converts high-level goals into actionable plans with milestones, habits, and time allocation.

### 2. Behavioral Analysis
Analyzes habit patterns and provides personalized insights and recommendations.

### 3. Planning Optimization
Optimizes workload based on available time, consistency, and priorities.

### 4. Reflection Analysis
Analyzes journal entries for emotional insights and actionable suggestions.

See `/server/ai/README.md` for detailed documentation.

## ⚙ Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- AI API Key (Anthropic or OpenAI) - optional

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with MongoDB URI, JWT secret, and AI_API_KEY
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

## 📁 Project Structure

```
├── server/
│   ├── ai/                    ⭐ NEW AI Module
│   │   ├── aiClient.js
│   │   ├── modules/
│   │   ├── validators/
│   │   └── README.md
│   ├── controllers/
│   │   ├── aiController.js    ⭐ NEW
│   │   └── ...
│   ├── routes/
│   │   ├── aiRoutes.js        ⭐ NEW
│   │   └── ...
│   └── ...
└── client/
    └── ...
```

## 🔧 Environment Variables

```env
# Required
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

# AI Features (Optional)
AI_PROVIDER=anthropic
AI_API_KEY=your_api_key
AI_MODEL=claude-3-5-sonnet-20241022
```

## 📈 API Endpoints

### AI Endpoints
- `GET /api/ai/status` - Check AI availability
- `POST /api/ai/decompose-goal` - Decompose goal
- `POST /api/ai/analyze-behavior` - Analyze behavior
- `POST /api/ai/optimize-plan` - Optimize plan
- `POST /api/ai/analyze-reflection` - Analyze reflection

See documentation for full API reference.

## 📄 License

MIT License
