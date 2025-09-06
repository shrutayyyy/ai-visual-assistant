// VoiceEyes Pro - Advanced AI Visual Assistant
// API Configuration
const GOOGLE_VISION_API_KEY = 'AIzaSyDCy6bkrz6CUYbwZGCoWacEaKEvM-U4ttU';
const ELEVENLABS_API_KEY = 'sk_3b44b143ef48aae7066bfb7753eee96885329bb3eeb91243';
const ELEVENLABS_VOICE_ID = 'pNInz6obpgDQGcFmaJgB';

class VoiceEyesPro {
    constructor() {
        // Core properties
        this.video = document.getElementById('video');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stream = null;
        this.recognition = null;
        this.isListening = false;
        this.isSpeaking = false;
        this.currentAudio = null;
        this.isProcessingVoiceCommand = false;
        
        // Accessibility features
        this.darkModeEnabled = false;
        this.highContrastEnabled = false;
        this.largeFontEnabled = false;
        this.hapticEnabled = true;
        this.spatialNavEnabled = false;
        this.distanceModeEnabled = false;
        this.obstacleModeEnabled = false;
        this.contrastModeEnabled = false;
        this.readabilityModeEnabled = false;
        this.lightingModeEnabled = false;
        this.audioBeaconEnabled = false;
        this.voiceNavEnabled = false;
        this.soundscapeEnabled = false;
        
        // Camera and detection
        this.currentDevices = [];
        this.currentDeviceIndex = 0;
        this.detectedObjects = [];
        
        // Audio context for beacons and soundscape
        this.audioContext = null;
        this.soundscapeInterval = null;
        
        this.initialize();
    }
    
    initialize() {
        this.setupEventListeners();
        this.setupAdvancedFeatures();
        this.checkAPIKeys();
        this.detectMobileDevice();
        this.initializeTheme();
    }
    
    setupEventListeners() {
        // Camera controls
        document.getElementById('startCamera').addEventListener('click', () => this.startCamera());
        document.getElementById('switchCamera').addEventListener('click', () => this.showCameraSelector());
        document.getElementById('captureBtn').addEventListener('click', () => this.captureAndDescribe());
        
        // Voice controls
        document.getElementById('voiceBtn').addEventListener('click', () => this.toggleVoiceCommands());
        document.getElementById('repeatBtn').addEventListener('click', () => this.repeatLastResponse());
        
        // Accessibility toggles
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());
        document.getElementById('highContrastToggle').addEventListener('click', () => this.toggleHighContrast());
        document.getElementById('fontSizeToggle').addEventListener('click', () => this.toggleLargeFont());
        document.getElementById('hapticToggle').addEventListener('click', () => this.toggleHaptic());
        
        // Toolbar features
        document.getElementById('spatialNav').addEventListener('click', () => this.toggleSpatialNav());
        document.getElementById('distanceMode').addEventListener('click', () => this.toggleDistanceMode());
        document.getElementById('obstacleMode').addEventListener('click', () => this.toggleObstacleMode());
        document.getElementById('contrastMode').addEventListener('click', () => this.toggleContrastMode());
        document.getElementById('readabilityMode').addEventListener('click', () => this.toggleReadabilityMode());
        document.getElementById('lightingMode').addEventListener('click', () => this.toggleLightingMode());
        document.getElementById('audioBeacon').addEventListener('click', () => this.toggleAudioBeacon());
        document.getElementById('voiceNav').addEventListener('click', () => this.toggleVoiceNav());
        document.getElementById('soundscape').addEventListener('click', () => this.toggleSoundscape());
        
        // Navigation controls
        document.getElementById('scanLeft').addEventListener('click', () => this.scanDirection('left'));
        document.getElementById('scanCenter').addEventListener('click', () => this.scanDirection('center'));
        document.getElementById('scanRight').addEventListener('click', () => this.scanDirection('right'));
        
        // Phrase buttons
        document.querySelectorAll('.phrase-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const phrase = btn.getAttribute('data-phrase');
                this.handleVoiceCommand(phrase);
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Voice recognition setup
        if ('webkitSpeechRecognition' in window) {
            this.setupVoiceRecognition();
        }
    }
    
    setupAdvancedFeatures() {
        this.setupHapticFeedback();
        this.setupAudioBeacons();
        this.setupSoundscape();
        this.updateModeIndicator();
    }
    
    // Voice Recognition with Feedback Prevention
    setupVoiceRecognition() {
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = false; // Don't listen continuously
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        
        this.recognition.onresult = (event) => {
            const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
            console.log('Voice command heard:', command);
            this.handleVoiceCommand(command);
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceButton();
            // Only restart if voice nav is enabled and we're not speaking
            if (this.voiceNavEnabled && !this.isSpeaking) {
                setTimeout(() => this.startVoiceListening(), 1000);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            this.isListening = false;
            this.updateVoiceButton();
            
            if (event.error === 'not-allowed') {
                this.updateStatus('❌ Microphone access denied. Please allow microphone permissions.');
            } else if (event.error === 'no-speech') {
                this.updateStatus('🎤 No speech detected. Try speaking again.');
            } else {
                this.updateStatus('❌ Voice recognition error. Please try again.');
            }
        };
    }
    
    toggleVoiceCommands() {
        if (this.isListening) {
            this.stopVoiceListening();
            document.getElementById('voiceBtn').textContent = '🎤 Voice Commands';
            this.updateStatus('Voice commands disabled');
        } else {
            this.startVoiceListening();
            document.getElementById('voiceBtn').textContent = '🔇 Stop Listening';
        }
    }
    
    startVoiceListening() {
        if (!this.isListening && this.recognition) {
            this.recognition.start();
            this.isListening = true;
            this.updateStatus('🎤 Listening for voice commands...');
            this.updateVoiceButton();
        }
    }
    
    stopVoiceListening() {
        if (this.isListening && this.recognition) {
            this.recognition.stop();
            this.isListening = false;
            this.updateVoiceButton();
        }
    }
    
    updateVoiceButton() {
        const voiceBtn = document.getElementById('voiceBtn');
        if (this.isListening) {
            voiceBtn.textContent = '🔇 Stop Listening';
            voiceBtn.classList.add('voice-nav-active');
        } else {
            voiceBtn.textContent = '🎤 Voice Commands';
            voiceBtn.classList.remove('voice-nav-active');
        }
    }
    
    // Enhanced Voice Command Handling with Feedback Prevention
    handleVoiceCommand(command) {
        if (this.isProcessingVoiceCommand) {
            console.log('Already processing voice command, ignoring:', command);
            return;
        }
        
        this.isProcessingVoiceCommand = true;
        
        // Stop any current speech to prevent feedback
        this.stopSpeaking();
        
        // Add delay to ensure audio is fully stopped
        setTimeout(() => {
            console.log('Processing voice command:', command);
            
            if (command.includes('color') || command.includes('colour')) {
                this.captureAndDescribeColors();
            } else if (command.includes('read') || command.includes('text')) {
                this.captureAndReadText();
            } else if (command.includes('describe') || command.includes('scene') || command.includes('see')) {
                this.captureAndDescribe();
            } else if (command.includes('repeat')) {
                this.repeatLastResponse();
            } else {
                this.captureAndDescribe();
            }
            
            // Reset processing flag after a delay
            setTimeout(() => {
                this.isProcessingVoiceCommand = false;
            }, 2000);
        }, 500);
    }
    
    // Enhanced Audio Management with Feedback Prevention
    async speakText(text) {
        // Stop voice recognition while speaking to prevent feedback loop
        this.stopVoiceListening();
        this.isSpeaking = true;
        
        // Wait to ensure all audio is stopped
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use ElevenLabs for better voice quality
        const useElevenLabs = true;
        
        if (useElevenLabs && !ELEVENLABS_API_KEY.includes('YOUR_')) {
            try {
                // Add timeout to prevent hanging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': ELEVENLABS_API_KEY
                    },
                    body: JSON.stringify({
                        text: text,
                        model_id: 'eleven_monolingual_v1',
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.5
                        }
                    }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const audioBlob = await response.blob();
                    
                    if (audioBlob.size === 0) {
                        console.warn('Empty audio blob received from ElevenLabs, falling back to browser TTS');
                        this.fallbackTTS(text);
                        return;
                    }
                    
                    const audioUrl = URL.createObjectURL(audioBlob);
                    this.currentAudio = new Audio(audioUrl);
                    
                    this.currentAudio.onended = () => {
                        URL.revokeObjectURL(audioUrl);
                        this.currentAudio = null;
                        this.isSpeaking = false;
                        // Restart voice recognition after speaking ends
                        if (this.voiceNavEnabled) {
                            setTimeout(() => this.startVoiceListening(), 1000);
                        }
                    };
                    
                    this.currentAudio.onerror = (error) => {
                        console.error('Audio playback error:', error);
                        URL.revokeObjectURL(audioUrl);
                        this.currentAudio = null;
                        this.isSpeaking = false;
                        this.fallbackTTS(text);
                        if (this.voiceNavEnabled) {
                            setTimeout(() => this.startVoiceListening(), 1000);
                        }
                    };
                    
                    try {
                        await this.currentAudio.play();
                    } catch (playError) {
                        console.error('Audio play error:', playError);
                        URL.revokeObjectURL(audioUrl);
                        this.currentAudio = null;
                        this.isSpeaking = false;
                        this.fallbackTTS(text);
                        if (this.voiceNavEnabled) {
                            setTimeout(() => this.startVoiceListening(), 1000);
                        }
                    }
                } else {
                    console.warn('ElevenLabs API response not ok:', response.status);
                    this.fallbackTTS(text);
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.warn('ElevenLabs request timed out, falling back to browser TTS');
                } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    console.warn('Network error with ElevenLabs, falling back to browser TTS');
                } else {
                    console.error('ElevenLabs TTS error:', error);
                }
                this.fallbackTTS(text);
            }
        } else {
            this.fallbackTTS(text);
        }
    }
    
    stopSpeaking() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio.load();
            this.currentAudio = null;
        }
        
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            // Speak a silent utterance to ensure cancellation
            const silentUtterance = new SpeechSynthesisUtterance('');
            silentUtterance.volume = 0;
            speechSynthesis.speak(silentUtterance);
        }
        
        this.isSpeaking = false;
    }
    
    fallbackTTS(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            utterance.onend = () => {
                this.isSpeaking = false;
                if (this.voiceNavEnabled) {
                    setTimeout(() => this.startVoiceListening(), 1000);
                }
            };
            
            utterance.onerror = () => {
                this.isSpeaking = false;
                if (this.voiceNavEnabled) {
                    setTimeout(() => this.startVoiceListening(), 1000);
                }
            };
            
            try {
                speechSynthesis.speak(utterance);
                console.log('Using browser TTS fallback');
            } catch (error) {
                console.error('Browser TTS error:', error);
                this.isSpeaking = false;
            }
        }
    }
    
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
        
        this.stopSoundscape();
        
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
        
        this.soundscapeInterval = setInterval(() => {
            if (this.soundscapeEnabled && this.audioContext) {
                if (Math.random() < 0.3) {
                    createTone(800 + Math.random() * 400, 0.02, 0.5 + Math.random() * 1);
                }
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
            document.querySelectorAll('[style*="display: flex"]').forEach(modal => {
                if (modal.id.includes('modal') || modal.id.includes('Modal')) {
                    modal.style.display = 'none';
                }
            });
        }
    }
    
    // Accessibility Toggle Methods
    toggleDarkMode() {
        this.darkModeEnabled = !this.darkModeEnabled;
        document.documentElement.setAttribute('data-theme', this.darkModeEnabled ? 'dark' : 'light');
        document.getElementById('darkModeToggle').setAttribute('aria-pressed', this.darkModeEnabled);
        document.getElementById('darkModeToggle').classList.toggle('active', this.darkModeEnabled);
        this.hapticFeedback('short');
        this.updateStatus(this.darkModeEnabled ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
        
        // Save preference to localStorage
        localStorage.setItem('voiceEyesDarkMode', this.darkModeEnabled);
    }
    
    toggleHighContrast() {
        this.highContrastEnabled = !this.highContrastEnabled;
        document.documentElement.setAttribute('data-theme', this.highContrastEnabled ? 'high-contrast' : 'light');
        document.getElementById('highContrastToggle').setAttribute('aria-pressed', this.highContrastEnabled);
        document.getElementById('highContrastToggle').classList.toggle('active', this.highContrastEnabled);
        this.hapticFeedback('short');
        this.updateStatus(this.highContrastEnabled ? '🌓 High contrast mode enabled' : 'High contrast mode disabled');
    }
    
    toggleLargeFont() {
        this.largeFontEnabled = !this.largeFontEnabled;
        document.body.classList.toggle('large-font', this.largeFontEnabled);
        document.getElementById('fontSizeToggle').setAttribute('aria-pressed', this.largeFontEnabled);
        document.getElementById('fontSizeToggle').classList.toggle('active', this.largeFontEnabled);
        this.hapticFeedback('short');
        this.updateStatus(this.largeFontEnabled ? '🔍 Large font mode enabled' : 'Large font mode disabled');
    }
    
    toggleHaptic() {
        this.hapticEnabled = !this.hapticEnabled;
        document.getElementById('hapticToggle').setAttribute('aria-pressed', this.hapticEnabled);
        document.getElementById('hapticToggle').classList.toggle('active', this.hapticEnabled);
        this.hapticFeedback('short');
        this.updateStatus(this.hapticEnabled ? '📳 Haptic feedback enabled' : 'Haptic feedback disabled');
    }
    
    toggleSpatialNav() {
        this.spatialNavEnabled = !this.spatialNavEnabled;
        document.getElementById('spatialNav').setAttribute('aria-pressed', this.spatialNavEnabled);
        document.getElementById('spatialNav').classList.toggle('active', this.spatialNavEnabled);
        document.getElementById('spatialPanel').style.display = this.spatialNavEnabled ? 'block' : 'none';
        this.hapticFeedback('short');
        this.updateStatus(this.spatialNavEnabled ? '🧭 Spatial navigation enabled - 9-point grid active' : 'Spatial navigation disabled');
        this.updateModeIndicator();
    }
    
    toggleDistanceMode() {
        this.distanceModeEnabled = !this.distanceModeEnabled;
        document.getElementById('distanceMode').setAttribute('aria-pressed', this.distanceModeEnabled);
        document.getElementById('distanceMode').classList.toggle('active', this.distanceModeEnabled);
        this.hapticFeedback('short');
        this.updateStatus(this.distanceModeEnabled ? '📏 Distance estimation enabled - Measuring object distances' : 'Distance estimation disabled');
        this.updateModeIndicator();
    }
    
    toggleObstacleMode() {
        this.obstacleModeEnabled = !this.obstacleModeEnabled;
        document.getElementById('obstacleMode').setAttribute('aria-pressed', this.obstacleModeEnabled);
        document.getElementById('obstacleMode').classList.toggle('active', this.obstacleModeEnabled);
        this.hapticFeedback('short');
        this.updateStatus(this.obstacleModeEnabled ? '⚠️ Obstacle detection enabled - Scanning for hazards' : 'Obstacle detection disabled');
        this.updateModeIndicator();
    }
    
    toggleContrastMode() {
        this.contrastModeEnabled = !this.contrastModeEnabled;
        document.getElementById('contrastMode').setAttribute('aria-pressed', this.contrastModeEnabled);
        document.getElementById('contrastMode').classList.toggle('active', this.contrastModeEnabled);
        this.hapticFeedback('short');
        this.updateStatus(this.contrastModeEnabled ? '🎨 Contrast analysis enabled - Checking color contrast' : 'Contrast analysis disabled');
        this.updateModeIndicator();
    }
    
    toggleReadabilityMode() {
        this.readabilityModeEnabled = !this.readabilityModeEnabled;
        document.getElementById('readabilityMode').setAttribute('aria-pressed', this.readabilityModeEnabled);
        document.getElementById('readabilityMode').classList.toggle('active', this.readabilityModeEnabled);
        this.hapticFeedback('short');
        this.updateStatus(this.readabilityModeEnabled ? '📖 Text readability enabled - Analyzing text clarity' : 'Text readability disabled');
        this.updateModeIndicator();
    }
    
    toggleLightingMode() {
        this.lightingModeEnabled = !this.lightingModeEnabled;
        document.getElementById('lightingMode').setAttribute('aria-pressed', this.lightingModeEnabled);
        document.getElementById('lightingMode').classList.toggle('active', this.lightingModeEnabled);
        this.hapticFeedback('short');
        this.updateStatus(this.lightingModeEnabled ? '💡 Lighting analysis enabled - Checking brightness levels' : 'Lighting analysis disabled');
        this.updateModeIndicator();
    }
    
    toggleAudioBeacon() {
        this.audioBeaconEnabled = !this.audioBeaconEnabled;
        document.getElementById('audioBeacon').setAttribute('aria-pressed', this.audioBeaconEnabled);
        document.getElementById('audioBeacon').classList.toggle('active', this.audioBeaconEnabled);
        this.hapticFeedback('short');
        this.updateStatus(this.audioBeaconEnabled ? '🔊 Audio beacons enabled - Directional sound cues active' : 'Audio beacons disabled');
    }
    
    toggleVoiceNav() {
        this.voiceNavEnabled = !this.voiceNavEnabled;
        document.getElementById('voiceNav').setAttribute('aria-pressed', this.voiceNavEnabled);
        document.getElementById('voiceNav').classList.toggle('active', this.voiceNavEnabled);
        
        if (this.voiceNavEnabled) {
            this.startVoiceListening();
            this.updateStatus('🗣️ Voice navigation enabled - Start speaking commands!');
        } else {
            this.stopVoiceListening();
            this.updateStatus('Voice navigation disabled');
        }
        
        this.hapticFeedback('short');
    }
    
    toggleSoundscape() {
        this.soundscapeEnabled = !this.soundscapeEnabled;
        document.getElementById('soundscape').setAttribute('aria-pressed', this.soundscapeEnabled);
        document.getElementById('soundscape').classList.toggle('active', this.soundscapeEnabled);
        
        if (this.soundscapeEnabled) {
            this.startSoundscape();
            this.updateStatus('🌿 Environmental soundscape enabled');
        } else {
            this.stopSoundscape();
            this.updateStatus('Environmental soundscape disabled');
        }
        
        this.hapticFeedback('short');
    }
    
    // Initialize theme from localStorage
    initializeTheme() {
        const savedTheme = localStorage.getItem('voiceEyesDarkMode');
        if (savedTheme === 'true') {
            this.darkModeEnabled = true;
            document.documentElement.setAttribute('data-theme', 'dark');
            document.getElementById('darkModeToggle').setAttribute('aria-pressed', 'true');
            document.getElementById('darkModeToggle').classList.add('active');
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.voiceEyesApp = new VoiceEyesPro();
});
