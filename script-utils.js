// VoiceEyes Pro - Additional Utility Methods
// This file contains the remaining methods for the VoiceEyesPro class

// Add these methods to the VoiceEyesPro class

// Haptic Feedback
setupHapticFeedback() {
    if ('vibrate' in navigator) {
        console.log('Haptic feedback available');
    } else {
        console.log('Haptic feedback not supported on this device');
    }
}

hapticFeedback(type) {
    if (!this.hapticEnabled || !('vibrate' in navigator)) return;
    
    const patterns = {
        'short': [100],
        'long': [300],
        'double': [100, 50, 100],
        'success': [100, 50, 100, 50, 200],
        'error': [200, 100, 200, 100, 200]
    };
    
    navigator.vibrate(patterns[type] || patterns.short);
}

// Audio Beacons
setupAudioBeacons() {
    try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('Audio context initialized for beacons');
    } catch (error) {
        console.log('Audio context not supported:', error);
    }
}

playAudioBeacon(type) {
    if (!this.audioBeaconEnabled || !this.audioContext) return;
    
    const frequencies = {
        'success': [800, 1000, 1200],
        'error': [400, 300, 200],
        'warning': [600, 500, 400],
        'info': [1000]
    };
    
    const freq = frequencies[type] || frequencies.info;
    
    freq.forEach((frequency, index) => {
        setTimeout(() => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        }, index * 100);
    });
}

// Soundscape
setupSoundscape() {
    try {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        console.log('Soundscape initialized');
    } catch (error) {
        console.log('Soundscape not supported:', error);
    }
}

startSoundscape() {
    if (!this.soundscapeEnabled || !this.audioContext) return;
    
    this.stopSoundscape(); // Stop any existing soundscape
    
    const createTone = (frequency, volume, duration) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    };
    
    // Create ambient forest sounds
    this.soundscapeInterval = setInterval(() => {
        if (this.soundscapeEnabled && this.audioContext) {
            // Random bird chirps
            if (Math.random() < 0.3) {
                createTone(800 + Math.random() * 400, 0.02, 0.5 + Math.random() * 1);
            }
            // Wind sounds
            if (Math.random() < 0.2) {
                createTone(200 + Math.random() * 100, 0.01, 2 + Math.random() * 3);
            }
        }
    }, 2000);
}

stopSoundscape() {
    if (this.soundscapeInterval) {
        clearInterval(this.soundscapeInterval);
        this.soundscapeInterval = null;
    }
}

// Spatial Navigation
generateNavigationPoints() {
    const grid = document.getElementById('navigationGrid');
    grid.innerHTML = '';
    
    const positions = [
        { name: 'Top Left', icon: '↖️' },
        { name: 'Top Center', icon: '⬆️' },
        { name: 'Top Right', icon: '↗️' },
        { name: 'Middle Left', icon: '⬅️' },
        { name: 'Center', icon: '🎯' },
        { name: 'Middle Right', icon: '➡️' },
        { name: 'Bottom Left', icon: '↙️' },
        { name: 'Bottom Center', icon: '⬇️' },
        { name: 'Bottom Right', icon: '↘️' }
    ];
    
    positions.forEach((pos, index) => {
        const point = document.createElement('div');
        point.className = 'nav-point';
        point.textContent = pos.icon;
        point.setAttribute('aria-label', pos.name);
        point.addEventListener('click', () => this.navigateToPoint(index));
        grid.appendChild(point);
    });
}

navigateToPoint(index) {
    const points = document.querySelectorAll('.nav-point');
    points.forEach(point => point.classList.remove('active'));
    points[index].classList.add('active');
    
    const positions = ['top left', 'top center', 'top right', 'middle left', 'center', 'middle right', 'bottom left', 'bottom center', 'bottom right'];
    const position = positions[index];
    
    this.speakText(`Navigating to ${position} of the scene`);
    this.hapticFeedback('short');
    this.playAudioBeacon('info');
}

scanDirection(direction) {
    const directions = {
        'left': 'left side',
        'center': 'center',
        'right': 'right side'
    };
    
    this.speakText(`Scanning ${directions[direction]} of the scene`);
    this.hapticFeedback('short');
    this.captureAndDescribe();
}

// Mode Indicator
updateModeIndicator() {
    const indicator = document.getElementById('modeIndicator');
    const activeModes = [];
    
    if (this.spatialNavEnabled) activeModes.push('Spatial');
    if (this.distanceModeEnabled) activeModes.push('Distance');
    if (this.obstacleModeEnabled) activeModes.push('Obstacles');
    if (this.contrastModeEnabled) activeModes.push('Contrast');
    if (this.readabilityModeEnabled) activeModes.push('Readability');
    if (this.lightingModeEnabled) activeModes.push('Lighting');
    
    if (activeModes.length > 0) {
        indicator.textContent = `Mode: ${activeModes.join(', ')}`;
        indicator.style.background = 'linear-gradient(45deg, #4ecdc4, #44a08d)';
    } else {
        indicator.textContent = 'Ready';
        indicator.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a24)';
    }
}

// Camera Stats
updateCameraStats(visionData) {
    const responses = visionData.responses[0];
    const objects = responses.localizedObjectAnnotations || [];
    const labels = responses.labelAnnotations || [];
    
    document.getElementById('objectCount').textContent = objects.length + labels.length;
    
    if (this.distanceModeEnabled && objects.length > 0) {
        // Simple distance estimation based on object size
        const avgSize = objects.reduce((sum, obj) => {
            const vertices = obj.boundingPoly.normalizedVertices;
            const width = Math.abs(vertices[2].x - vertices[0].x);
            const height = Math.abs(vertices[2].y - vertices[0].y);
            return sum + (width + height) / 2;
        }, 0) / objects.length;
        
        let distance = 'Close';
        if (avgSize < 0.1) distance = 'Far';
        else if (avgSize < 0.3) distance = 'Medium';
        
        document.getElementById('distanceValue').textContent = distance;
    }
}

// Object Detection Visualization
drawObjectBoxes(visionData) {
    const overlay = document.getElementById('cameraOverlay');
    overlay.innerHTML = '';
    
    const responses = visionData.responses[0];
    const objects = responses.localizedObjectAnnotations || [];
    
    objects.forEach(obj => {
        const vertices = obj.boundingPoly.normalizedVertices;
        const left = vertices[0].x * this.video.offsetWidth;
        const top = vertices[0].y * this.video.offsetHeight;
        const width = (vertices[2].x - vertices[0].x) * this.video.offsetWidth;
        const height = (vertices[2].y - vertices[0].y) * this.video.offsetHeight;
        
        const box = document.createElement('div');
        box.className = 'detection-box';
        box.style.left = left + 'px';
        box.style.top = top + 'px';
        box.style.width = width + 'px';
        box.style.height = height + 'px';
        
        const label = document.createElement('div');
        label.className = 'detection-label';
        label.textContent = obj.name;
        
        box.appendChild(label);
        overlay.appendChild(box);
    });
}

// Mobile Detection
detectMobileDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.body.classList.add('mobile-device');
    }
}

// Keyboard Navigation
handleKeyboard(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.classList.contains('btn') || e.target.classList.contains('toolbar-btn')) {
            e.preventDefault();
            e.target.click();
        }
    }
    
    if (e.key === 'Escape') {
        // Close any open modals
        document.querySelectorAll('[style*="display: flex"]').forEach(modal => {
            if (modal.id.includes('modal') || modal.id.includes('Modal')) {
                modal.style.display = 'none';
            }
        });
    }
}

// Additional Analysis Methods
isObstacle(object) {
    const obstacleKeywords = ['person', 'vehicle', 'bicycle', 'motorcycle', 'car', 'truck', 'bus', 'chair', 'table', 'door', 'wall'];
    return obstacleKeywords.some(keyword => 
        object.name.toLowerCase().includes(keyword)
    );
}

calculateContrast(rgb1, rgb2) {
    const getLuminance = (r, g, b) => {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
}

getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

calculateBrightness(r, g, b) {
    return (r * 299 + g * 587 + b * 114) / 1000;
}
