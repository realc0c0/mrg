// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Game state
let gameState = {
    coins: 0,
    clickPower: 1,
    level: 1
};

// DOM Elements
const coinCount = document.getElementById('coinCount');
const clickPower = document.getElementById('clickPower');
const tapButton = document.getElementById('tapButton');
const upgradeButton = document.getElementById('upgradeButton');
const upgradeCost = document.getElementById('upgradeCost');
const userPhoto = document.getElementById('userPhoto');
const userName = document.getElementById('userName');
const userStatus = document.getElementById('userStatus');

// Initialize user data
async function initUser() {
    try {
        // Set user profile data
        if (tg.initDataUnsafe.user) {
            const user = tg.initDataUnsafe.user;
            userName.textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
            if (user.photo_url) {
                userPhoto.src = user.photo_url;
            }
            // Update status based on coins
            updateUserStatus();
        }

        const response = await fetch('/api/init-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: tg.initDataUnsafe.user.id,
                initData: tg.initData
            })
        });
        
        if (!response.ok) throw new Error('Failed to initialize user');
        
        gameState = await response.json();
        updateUI();
    } catch (error) {
        console.error('Error initializing user:', error);
    }
}

// Update user status based on coins
function updateUserStatus() {
    const titles = [
        { threshold: 0, name: 'Novice Gnome' },
        { threshold: 1000, name: 'Skilled Gnome' },
        { threshold: 5000, name: 'Expert Gnome' },
        { threshold: 10000, name: 'Master Gnome' },
        { threshold: 50000, name: 'Legendary Gnome' }
    ];

    const currentTitle = titles.reduce((acc, title) => {
        if (gameState.coins >= title.threshold) return title;
        return acc;
    }, titles[0]);

    userStatus.textContent = currentTitle.name;
}

// Update UI elements with animations
function updateUI() {
    // Animate coin count
    const oldCoins = parseInt(coinCount.textContent);
    animateValue(coinCount, oldCoins, gameState.coins, 500);
    
    // Update click power with bounce animation
    if (parseInt(clickPower.textContent) !== gameState.clickPower) {
        clickPower.textContent = gameState.clickPower;
        tapButton.classList.add('animate__bounceIn');
        setTimeout(() => tapButton.classList.remove('animate__bounceIn'), 750);
    }

    // Calculate and update upgrade cost
    const cost = Math.floor(100 * Math.pow(1.5, gameState.clickPower - 1));
    upgradeCost.textContent = cost;
    upgradeButton.disabled = gameState.coins < cost;

    // Update user status
    updateUserStatus();
}

// Animate number changes
function animateValue(element, start, end, duration) {
    const range = end - start;
    const minFrame = 30;
    let currentFrame = 0;
    const totalFrames = Math.max(minFrame, Math.min(60, Math.abs(range)));
    
    const animateFrame = () => {
        currentFrame++;
        const progress = currentFrame / totalFrames;
        const currentValue = Math.floor(start + (range * progress));
        element.textContent = currentValue;
        
        if (currentFrame < totalFrames) {
            requestAnimationFrame(animateFrame);
        }
    };
    
    animateFrame();
}

// Create coin popup with random rotation and position variation
function createCoinPopup(x, y, amount) {
    const popup = document.createElement('div');
    popup.className = 'coin-popup';
    popup.textContent = `+${amount}`;
    
    // Add random position variation
    const variation = 20;
    const randomX = (Math.random() - 0.5) * variation;
    const randomRotation = (Math.random() - 0.5) * 30;
    
    popup.style.left = `${x + randomX}px`;
    popup.style.top = `${y}px`;
    popup.style.transform = `rotate(${randomRotation}deg)`;
    
    document.body.appendChild(popup);
    
    popup.addEventListener('animationend', () => {
        popup.remove();
    });
}

// Handle tap
async function handleTap(event) {
    try {
        const response = await fetch('/api/click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: tg.initDataUnsafe.user.id
            })
        });

        if (!response.ok) {
            if (response.status === 429) return; // Clicking too fast
            throw new Error('Failed to process click');
        }

        gameState = await response.json();
        updateUI();

        // Create popup at click location with random variation
        createCoinPopup(
            event.clientX || event.touches[0].clientX,
            event.clientY || event.touches[0].clientY,
            gameState.clickPower
        );

        // Add ripple effect
        const ripple = tapButton.querySelector('.tap-ripple');
        ripple.style.width = '0';
        ripple.style.height = '0';
        ripple.style.opacity = '1';
        
        requestAnimationFrame(() => {
            ripple.style.width = '200%';
            ripple.style.height = '200%';
            ripple.style.opacity = '0';
        });

        // Add haptic feedback
        tg.HapticFeedback.impactOccurred('light');
    } catch (error) {
        console.error('Error processing click:', error);
    }
}

// Handle upgrade with animation
async function handleUpgrade() {
    try {
        const response = await fetch('/api/upgrade', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: tg.initDataUnsafe.user.id
            })
        });

        if (!response.ok) throw new Error('Failed to upgrade');

        gameState = await response.json();
        
        // Add upgrade animation
        upgradeButton.classList.add('animate__pulse');
        setTimeout(() => upgradeButton.classList.remove('animate__pulse'), 500);
        
        updateUI();

        // Add haptic feedback
        tg.HapticFeedback.notificationOccurred('success');
    } catch (error) {
        console.error('Error upgrading:', error);
    }
}

// Event listeners
tapButton.addEventListener('click', handleTap);
tapButton.addEventListener('touchstart', handleTap);
upgradeButton.addEventListener('click', handleUpgrade);

// Initialize the game
initUser();
