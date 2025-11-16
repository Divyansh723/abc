# HabitForge Backend API

A Node.js/Express backend API for the HabitForge habit tracking application with MongoDB integration.

## Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **Habit Management**: CRUD operations for habits with categories and customization
- **Progress Tracking**: Completion tracking with streaks and statistics
- **Gamification**: XP system and forgiveness tokens
- **Data Analytics**: Habit statistics and progress insights
- **Security**: Rate limiting, CORS, helmet, input validation
- **Database**: MongoDB with Mongoose ODM

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository and navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=8000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/habitforge
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/habitforge

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   JWT_REFRESH_EXPIRES_IN=30d

   # CORS Configuration
   FRONTEND_URL=http://localhost:3001
   ```

4. **Start MongoDB:**
   
   **Local MongoDB:**
   ```bash
   mongod
   ```
   
   **Or use MongoDB Atlas** (update MONGODB_URI in .env)

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Habits
- `GET /api/habits` - Get user's habits
- `POST /api/habits` - Create new habit
- `GET /api/habits/:id` - Get specific habit
- `PATCH /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/complete` - Mark habit as complete
- `POST /api/habits/:id/forgiveness` - Use forgiveness token
- `GET /api/habits/:id/stats` - Get habit statistics
- `GET /api/habits/:id/completions` - Get habit completions
- `GET /api/habits/completions/today` - Get today's completions

### Health Check
- `GET /api/health` - API health status
- `GET /api` - API documentation

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  timezone: String,
  level: Number,
  totalXP: Number,
  forgivenessTokens: Number,
  notificationPreferences: Object,
  privacySettings: Object,
  // ... other fields
}
```

### Habit Model
```javascript
{
  userId: ObjectId,
  name: String,
  description: String,
  category: String,
  frequency: String,
  color: String,
  icon: String,
  currentStreak: Number,
  longestStreak: Number,
  totalCompletions: Number,
  consistencyRate: Number,
  // ... other fields
}
```

### Completion Model
```javascript
{
  habitId: ObjectId,
  userId: ObjectId,
  completedAt: Date,
  deviceTimezone: String,
  xpEarned: Number,
  forgivenessUsed: Boolean,
  notes: String,
  mood: Number,
  // ... other fields
}
```

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (when implemented)

### Project Structure
```
server/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── habitController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Habit.js
│   │   ├── Completion.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── habits.js
│   │   └── index.js
│   └── server.js
├── .env
├── .env.example
├── package.json
└── README.md
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents API abuse
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: express-validator for request validation
- **Error Handling**: Comprehensive error handling and logging

## Production Deployment

1. **Set environment to production:**
   ```env
   NODE_ENV=production
   ```

2. **Use strong JWT secrets:**
   ```bash
   openssl rand -base64 64
   ```

3. **Configure MongoDB Atlas** for production database

4. **Set up process manager:**
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name habitforge-api
   ```

5. **Configure reverse proxy** (nginx/Apache) for HTTPS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details