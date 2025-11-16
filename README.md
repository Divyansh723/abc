# HabitForge

A modern, gamified habit-tracking web application built with React, TypeScript, and Tailwind CSS.

## Features

- 🎯 **Habit Tracking**: Create and track custom habits with flexible scheduling
- 🎮 **Gamification**: XP points, levels, streaks, and achievement badges
- 🤖 **AI Coaching**: Personalized motivational messages and insights
- 🌙 **Dark Mode**: Beautiful light and dark themes with smooth transitions
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- 👥 **Community**: Join circles, share progress, and stay accountable
- 📊 **Analytics**: Detailed insights and progress visualization
- 🔒 **Privacy-First**: Granular controls and transparent data handling

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom theme system
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Charts**: Chart.js
- **Icons**: Lucide React
- **Testing**: Jest, React Testing Library
- **Documentation**: Storybook

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd habitforge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run storybook` - Start Storybook

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── layout/         # Layout components
│   ├── habit/          # Habit-specific components
│   ├── gamification/   # Gamification components
│   ├── analytics/      # Analytics components
│   └── community/      # Community components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── stores/             # Zustand stores
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── contexts/           # React contexts
└── routes/             # Route configuration
```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing ESLint and Prettier configuration
- Use functional components with hooks
- Implement proper error boundaries
- Write meaningful commit messages

### Component Development

- Create reusable components in the `ui/` directory
- Use proper TypeScript interfaces for props
- Implement accessibility features (ARIA labels, keyboard navigation)
- Support both light and dark themes
- Add Storybook stories for complex components

### Testing

- Write unit tests for utility functions
- Test component behavior, not implementation details
- Use React Testing Library for component tests
- Maintain good test coverage for critical paths

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/) for fast development
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)