const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware with Telegram-friendly CSP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "telegram.org", "*.telegram.org", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
            connectSrc: ["'self'", "telegram.org", "*.telegram.org"],
            imgSrc: ["'self'", "data:", "telegram.org", "*.telegram.org", "t.me"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "fonts.gstatic.com"],
        },
    },
}));

// Enable compression for all responses
app.use(compression());

// Enable CORS for Telegram domains
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        
        // Allow Telegram domains
        const allowedOrigins = [
            /^https:\/\/.*\.telegram\.org$/,
            /^https:\/\/.*\.t\.me$/
        ];
        
        if (allowedOrigins.some(regex => regex.test(origin))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

app.use(express.json());
app.use(express.static('public'));

// User data storage (in memory for demo)
const users = new Map();

// API Routes
app.post('/api/init-user', (req, res) => {
    try {
        const { userId, initData } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        if (!users.has(userId)) {
            users.set(userId, {
                coins: 0,
                clickPower: 1,
                lastClick: Date.now()
            });
        }
        res.json(users.get(userId));
    } catch (error) {
        console.error('Error in init-user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/click', (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = users.get(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const now = Date.now();
        const timeDiff = now - user.lastClick;
        
        // Prevent clicking too fast (minimum 100ms between clicks)
        if (timeDiff < 100) {
            return res.status(429).json({ error: 'Clicking too fast' });
        }

        user.coins += user.clickPower;
        user.lastClick = now;
        res.json(user);
    } catch (error) {
        console.error('Error in click:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/upgrade', (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = users.get(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const upgradeCost = Math.floor(100 * Math.pow(1.5, user.clickPower - 1));
        if (user.coins < upgradeCost) {
            return res.status(400).json({ error: 'Not enough coins' });
        }

        user.coins -= upgradeCost;
        user.clickPower += 1;
        res.json(user);
    } catch (error) {
        console.error('Error in upgrade:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve static files from public directory
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
