// Cherry blossom petal SVG patterns
const PETAL_TYPES = [
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23ffd1dc" d="M12,2C8.5,2,5.5,3.5,3.5,6c-2,2.5-2.5,5.5-1.5,8.5c1,3,3.5,5.5,6.5,6.5c3,1,6-0.5,8.5-2.5c2.5-2,4-5,4-8.5 C21,5.5,17,2,12,2z"/></svg>`,
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23ffd1dc" d="M12,2c-4,0-7,2-8.5,5.5C2,11,2.5,14,4.5,16.5c2,2.5,5,4,8.5,4c3.5,0,6.5-1.5,8.5-4c2-2.5,2.5-5.5,1.5-8.5 C21.5,4.5,18.5,2,12,2z"/></svg>`,
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23ffd1dc" d="M12,2C8,2,4.5,4.5,3,8c-1.5,3.5-1,7,1,10c2,3,5.5,4.5,9,4c3.5-0.5,6.5-3,7.5-6.5c1-3.5,0-7-2.5-9.5 C16.5,3.5,14,2,12,2z"/></svg>`
];

// Color variations for petals
const PETAL_COLORS = [
    'hue-rotate(0deg) brightness(1)',    // Original pink
    'hue-rotate(-10deg) brightness(1.1)', // Lighter pink
    'hue-rotate(10deg) brightness(0.9)'   // Darker pink
];

class CherryBlossom {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'petal-container';
        document.body.appendChild(this.container);
        
        // Create initial petals
        this.createPetals(50); // Increased number of petals
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    createPetal() {
        const petal = document.createElement('div');
        petal.className = 'petal';
        
        // Enhanced random properties for more natural movement
        const size = Math.random() * 20 + 8; // 8-28px
        const startX = Math.random() * 120 - 10; // -10 to 110vw for wider spread
        const endX = (Math.random() - 0.5) * 100; // Wider end position range
        const rotateEnd = Math.random() * 1080 - 540; // More rotation (-540 to 540 degrees)
        const duration = Math.random() * 15 + 8; // 8-23s fall duration
        const swayDuration = Math.random() * 6 + 2; // 2-8s sway duration
        const swayAmount = (Math.random() - 0.5) * 150; // Larger sway distance
        const delay = -Math.random() * 20; // Longer initial delay spread
        const opacity = Math.random() * 0.4 + 0.6; // 0.6-1.0 opacity
        
        // Set CSS variables for the animations
        petal.style.setProperty('--size', `${size}px`);
        petal.style.setProperty('--start-x', `${startX}vw`);
        petal.style.setProperty('--end-x', `${endX}px`);
        petal.style.setProperty('--end-rotate', `${rotateEnd}deg`);
        petal.style.setProperty('--fall-duration', `${duration}s`);
        petal.style.setProperty('--sway-duration', `${swayDuration}s`);
        petal.style.setProperty('--sway-amount', `${swayAmount}px`);
        petal.style.setProperty('--delay', `${delay}s`);
        petal.style.setProperty('--opacity', opacity);
        
        // Random petal type and color with weighted distribution
        const petalTypeIndex = Math.floor(Math.random() * PETAL_TYPES.length);
        const colorIndex = Math.floor(Math.random() * PETAL_COLORS.length);
        petal.style.setProperty('--petal-type', `url('${PETAL_TYPES[petalTypeIndex]}')`);
        petal.style.setProperty('--color-filter', PETAL_COLORS[colorIndex]);
        
        // Remove petal when animation ends and create a new one
        petal.addEventListener('animationend', () => {
            petal.remove();
            this.createPetal();
        });
        
        this.container.appendChild(petal);
    }
    
    createPetals(count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createPetal();
            }, Math.random() * 3000); // Stagger initial creation over 3 seconds
        }
    }
    
    handleResize() {
        // Clear existing petals
        this.container.innerHTML = '';
        // Create new petals
        this.createPetals(50);
    }
}

// Initialize cherry blossoms when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CherryBlossom();
}); 