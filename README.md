# Mr.Gnome - Telegram Mini App

A tap-to-earn game built as a Telegram Mini App where users can tap to earn coins and upgrade their clicking power.

## Features
- Modern dark theme UI with material design
- User profile integration with Telegram
- Coin earning system with animations
- Power upgrade system
- Responsive design for all devices
- Progress ranks (Novice to Legendary Gnome)

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables by copying `.env.example` to `.env`:
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Security
CORS_ENABLED=true

# App Settings
MIN_CLICK_INTERVAL=100
INITIAL_CLICK_POWER=1
BASE_UPGRADE_COST=100
UPGRADE_COST_MULTIPLIER=1.5
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Deployment

### Deploy to Heroku
1. Create a new Heroku app
2. Connect your GitHub repository
3. Add the following buildpack:
   - `heroku/nodejs`
4. Set environment variables in Heroku dashboard
5. Deploy from GitHub

### Deploy to Railway
1. Create new Railway project
2. Connect your GitHub repository
3. Railway will automatically detect Node.js
4. Set environment variables in Railway dashboard
5. Deploy

### Deploy to Vercel
1. Import your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy

## Telegram Bot Setup

1. Create a new bot through [@BotFather](https://t.me/BotFather)
2. Set up your Mini App:
   ```
   /newapp
   ```
3. Set your deployed URL as the Web App URL
4. Add the Mini App button to your bot:
   ```
   /mybots > (select your bot) > Bot Settings > Menu Button
   ```

## Project Structure
```
├── public/               # Static files
│   ├── index.html       # Main HTML file
│   ├── styles.css       # Styles
│   └── app.js          # Frontend JavaScript
├── server.js            # Express server
├── package.json         # Dependencies
└── .env                # Environment variables
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment mode | development |
| CORS_ENABLED | Enable CORS | true |
| MIN_CLICK_INTERVAL | Minimum ms between clicks | 100 |
| INITIAL_CLICK_POWER | Starting click power | 1 |
| BASE_UPGRADE_COST | Base cost for upgrades | 100 |
| UPGRADE_COST_MULTIPLIER | Cost increase multiplier | 1.5 |

## Security
- CORS configured for Telegram domains
- Helmet.js for security headers
- Content Security Policy (CSP) configured
- Rate limiting for click actions
- Input validation for all API endpoints
