# DesignMyLife - Backend Server

Backend server for the DesignMyLife platform - A Life OS for goal management, habit tracking, and life planning.

## 🚀 Features

- **Authentication System** - JWT-based secure auth
- **Goal Management** - CRUD operations for goals with linking
- **Habit Tracking** - Streak tracking and completion history
- **Task Management** - Priority-based task system
- **Life Simulation Engine** - Predictive progress modeling
- **File Compression** - Automatic file compression for storage optimization
- **System Analytics** - Life system health analysis
- **AI Integration** - Modular AI subsystem for goal decomposition, behavioral analysis, planning optimization, and reflection analysis

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## ⚙️ Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (use `.env.example` as template):
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

3. Start development server:
```bash
npm run dev
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `GET /api/goals/:id` - Get single goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/:id/link-habit` - Link habit to goal
- `POST /api/goals/:id/link-task` - Link task to goal

### Habits
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create habit
- `GET /api/habits/:id` - Get single habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/complete` - Mark habit complete
- `GET /api/habits/:id/stats` - Get habit statistics

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/today` - Get today's tasks
- `GET /api/tasks/upcoming` - Get upcoming tasks
- `GET /api/tasks/overdue` - Get overdue tasks
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Simulation
- `POST /api/simulation/goal/:id` - Simulate goal progress
- `GET /api/simulation/system-health` - Analyze system health
- `GET /api/simulation/insights` - Get productivity insights

### Files
- `POST /api/files/upload` - Upload file (with compression)
- `GET /api/files` - Get all files
- `GET /api/files/stats` - Get file statistics
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file

### AI (Optional - requires API key)
- `POST /api/ai/decompose-goal` - Decompose goal into structured plan
- `POST /api/ai/analyze-behavior` - Analyze habit patterns
- `POST /api/ai/optimize-plan` - Optimize task scheduling
- `POST /api/ai/analyze-reflection` - Analyze journal reflections
- `GET /api/ai/status` - Check AI system status

## 🏗 Project Structure

```
server/
├── config/         # Database configuration
├── controllers/    # Request handlers
├── middleware/     # Custom middleware
├── models/         # Mongoose schemas
├── routes/         # API routes
├── services/       # Business logic
├── ai/             # AI integration modules
│   ├── aiClient.js
│   ├── goalDecomposer.js
│   ├── behaviorAnalyzer.js
│   ├── planningOptimizer.js
│   ├── reflectionAnalyzer.js
│   └── validators/
├── storage/        # File storage
├── utils/          # Helper functions
├── app.js          # Express app setup
└── server.js       # Server entry point
```

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Protected routes
- Input validation
- Secure file handling

## 📦 File Compression

Files are automatically compressed using ZIP format with maximum compression level (9). The system:
- Compresses on upload
- Stores compressed version
- Decompresses on download
- Tracks compression metrics

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:5000/health
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 5000) |
| MONGO_URI | MongoDB connection string | Yes |
| JWT_SECRET | JWT signing secret | Yes |
| NODE_ENV | Environment mode | No (default: development) |
| AI_PROVIDER | AI provider (anthropic/openai) | No |
| AI_API_KEY | AI API key | No (enables AI features) |
| AI_MODEL | AI model to use | No |

## 🚀 Deployment

1. Set environment variables on hosting platform
2. Ensure MongoDB Atlas IP whitelist is configured
3. Deploy using platform-specific instructions

## 📄 License

MIT License
