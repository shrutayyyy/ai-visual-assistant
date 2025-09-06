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
        document.getElementById('startCamera').addEventListener('click', () => {
            console.log('Start camera clicked');
            this.startCamera();
        });
        document.getElementById('stopCamera').addEventListener('click', () => {
            console.log('Stop camera clicked');
            this.stopCamera();
        });
        document.getElementById('switchCamera').addEventListener('click', () => {
            console.log('Switch camera clicked');
            this.showCameraSelector();
        });
        document.getElementById('captureBtn').addEventListener('click', () => {
            console.log('Capture button clicked');
            this.captureAndDescribe();
        });
        
        // Voice controls
        document.getElementById('voiceBtn').addEventListener('click', () => {
            console.log('Voice button clicked');
            this.toggleVoiceCommands();
        });
        document.getElementById('repeatBtn').addEventListener('click', () => {
            console.log('Repeat button clicked');
            this.repeatLastResponse();
        });
        document.getElementById('stopSpeakingBtn').addEventListener('click', () => {
            console.log('Stop speaking button clicked');
            this.stopSpeaking();
        });
        
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
        // Prevent multiple simultaneous calls
        if (this.isSpeaking) {
            console.log('Already speaking, ignoring new text:', text);
            return;
        }
        
        // Stop any existing audio first
        this.stopSpeaking();
        
        // Stop voice recognition while speaking to prevent feedback loop
        this.stopVoiceListening();
        this.isSpeaking = true;
        
        // Show stop speaking button
        document.getElementById('stopSpeakingBtn').style.display = 'inline-flex';
        
        // Wait to ensure all audio is stopped
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use ElevenLabs for better voice quality
        const useElevenLabs = true;
        
        console.log('ElevenLabs API Key:', ELEVENLABS_API_KEY);
        console.log('ElevenLabs Voice ID:', ELEVENLABS_VOICE_ID);
        
        if (useElevenLabs && !ELEVENLABS_API_KEY.includes('YOUR_') && ELEVENLABS_API_KEY.length > 20) {
            console.log('Attempting to use ElevenLabs TTS...');
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
            console.log('Using fallback TTS (ElevenLabs not available)');
            this.fallbackTTS(text);
        }
    }
    
    stopSpeaking() {
        // Stop any current audio
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio.load();
            this.currentAudio = null;
        }
        
        // Stop all speech synthesis
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            // Wait a moment for cancellation to complete
            setTimeout(() => {
                // Speak a silent utterance to ensure cancellation
                const silentUtterance = new SpeechSynthesisUtterance('');
                silentUtterance.volume = 0;
                speechSynthesis.speak(silentUtterance);
            }, 100);
        }
        
        this.isSpeaking = false;
        
        // Hide stop speaking button
        document.getElementById('stopSpeakingBtn').style.display = 'none';
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
        
        if (this.spatialNavEnabled) {
            this.generateNavigationPoints();
        }
        
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

    // Core Camera Methods
    async startCamera() {
        try {
            this.updateStatus('📹 Starting camera...');
            this.hapticFeedback('short');
            
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment'
                }
            };
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
            this.video.onloadedmetadata = () => {
                this.video.play();
                this.updateStatus('📹 Camera ready! Click "Analyze Scene" to begin');
                this.enableCameraControls();
                this.hapticFeedback('success');
                this.playAudioBeacon('success');
            };
            
            this.video.onerror = (error) => {
                console.error('Video error:', error);
                this.updateStatus('❌ Camera error. Please check permissions and try again.');
                this.hapticFeedback('error');
                this.playAudioBeacon('error');
            };
            
            // Get available devices
            await this.getCameraDevices();
            
        } catch (error) {
            console.error('Camera access error:', error);
            this.handleCameraError(error);
        }
    }
    
    async getCameraDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.currentDevices = devices.filter(device => device.kind === 'videoinput');
            
            if (this.currentDevices.length > 1) {
                document.getElementById('switchCamera').disabled = false;
            }
        } catch (error) {
            console.error('Error getting camera devices:', error);
        }
    }
    
    handleCameraError(error) {
        let message = '❌ Camera access failed. ';
        
        if (error.name === 'NotAllowedError') {
            message += 'Please allow camera permissions and refresh the page.';
            document.getElementById('permissionHelp').style.display = 'flex';
        } else if (error.name === 'NotFoundError') {
            message += 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
            message += 'Camera not supported in this browser.';
        } else {
            message += 'Please check your camera and try again.';
        }
        
        this.updateStatus(message);
        this.hapticFeedback('error');
        this.playAudioBeacon('error');
    }
    
    enableCameraControls() {
        document.getElementById('voiceBtn').disabled = false;
        document.getElementById('repeatBtn').disabled = false;
        document.getElementById('stopCamera').disabled = false;
        document.getElementById('captureBtn').disabled = false;
        document.getElementById('stopCamera').style.display = 'inline-flex';
        document.getElementById('captureBtn').style.display = 'inline-flex';
        document.getElementById('startCamera').style.display = 'none';
        
        // Show switch camera button if multiple cameras available
        if (this.currentDevices.length > 1) {
            document.getElementById('switchCamera').disabled = false;
            document.getElementById('switchCamera').style.display = 'inline-flex';
        }
        
        // Show video and hide placeholder
        document.getElementById('video').style.display = 'block';
        document.getElementById('cameraPlaceholder').style.display = 'none';
    }
    
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.video.srcObject = null;
        this.video.pause();
        
        // Disable camera controls
        document.getElementById('voiceBtn').disabled = true;
        document.getElementById('repeatBtn').disabled = true;
        document.getElementById('stopCamera').disabled = true;
        document.getElementById('captureBtn').disabled = true;
        document.getElementById('switchCamera').disabled = true;
        document.getElementById('stopCamera').style.display = 'none';
        document.getElementById('captureBtn').style.display = 'none';
        document.getElementById('switchCamera').style.display = 'none';
        document.getElementById('startCamera').style.display = 'inline-flex';
        
        // Show placeholder and hide video
        document.getElementById('video').style.display = 'none';
        document.getElementById('cameraPlaceholder').style.display = 'flex';
        
        // Clear overlays
        document.getElementById('cameraOverlay').innerHTML = '';
        document.getElementById('description').textContent = 'Descriptions will appear here...';
        
        this.updateStatus('📹 Camera stopped. Click "Turn On Camera" to begin again.');
        this.hapticFeedback('short');
        this.playAudioBeacon('info');
    }
    
    showCameraSelector() {
        const modal = document.getElementById('cameraSelector');
        const cameraList = document.getElementById('cameraList');
        
        cameraList.innerHTML = '';
        
        this.currentDevices.forEach((device, index) => {
            const button = document.createElement('button');
            button.className = 'camera-option';
            button.textContent = device.label || `Camera ${index + 1}`;
            button.onclick = () => this.switchCamera(index);
            cameraList.appendChild(button);
        });
        
        modal.style.display = 'flex';
    }
    
    async switchCamera(deviceIndex) {
        try {
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }
            
            const constraints = {
                video: {
                    deviceId: { exact: this.currentDevices[deviceIndex].deviceId }
                }
            };
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            this.currentDeviceIndex = deviceIndex;
            
            document.getElementById('cameraSelector').style.display = 'none';
            this.updateStatus(`📹 Switched to ${this.currentDevices[deviceIndex].label || 'Camera'}`);
            this.hapticFeedback('short');
            
        } catch (error) {
            console.error('Camera switch error:', error);
            this.updateStatus('❌ Failed to switch camera');
            this.hapticFeedback('error');
        }
    }
    
    // Core Analysis Methods
    async captureAndDescribe() {
        if (!this.video.videoWidth || !this.video.videoHeight) {
            this.updateStatus('❌ Camera not ready. Please start camera first.');
            this.hapticFeedback('error');
            return;
        }
        
        try {
            this.updateStatus('🧠 Analyzing scene...');
            this.hapticFeedback('short');
            
            // Capture frame
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            this.ctx.drawImage(this.video, 0, 0);
            
            const imageData = this.canvas.toDataURL('image/jpeg', 0.8);
            const base64Data = imageData.split(',')[1];
            
            // Call Google Vision API
            const visionData = await this.callGoogleVisionAPI(base64Data, ['LABEL_DETECTION', 'OBJECT_LOCALIZATION', 'TEXT_DETECTION']);
            
            if (visionData && visionData.responses && visionData.responses[0]) {
                this.processVisionResults(visionData);
            } else {
                this.updateStatus('❌ Analysis failed. Please try again.');
                this.hapticFeedback('error');
            }
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.updateStatus('❌ Analysis failed. Please check your connection and try again.');
            this.hapticFeedback('error');
            this.playAudioBeacon('error');
        }
    }
    
    async captureAndDescribeColors() {
        if (!this.video.videoWidth || !this.video.videoHeight) {
            this.updateStatus('❌ Camera not ready. Please start camera first.');
            this.hapticFeedback('error');
            return;
        }
        
        try {
            this.updateStatus('🎨 Analyzing colors...');
            this.hapticFeedback('short');
            
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            this.ctx.drawImage(this.video, 0, 0);
            
            const imageData = this.canvas.toDataURL('image/jpeg', 0.8);
            const base64Data = imageData.split(',')[1];
            
            const visionData = await this.callGoogleVisionAPI(base64Data, ['IMAGE_PROPERTIES']);
            
            if (visionData && visionData.responses && visionData.responses[0]) {
                this.processColorAnalysis(visionData);
            } else {
                this.updateStatus('❌ Color analysis failed. Please try again.');
                this.hapticFeedback('error');
            }
            
        } catch (error) {
            console.error('Color analysis error:', error);
            this.updateStatus('❌ Color analysis failed. Please try again.');
            this.hapticFeedback('error');
        }
    }
    
    async captureAndReadText() {
        if (!this.video.videoWidth || !this.video.videoHeight) {
            this.updateStatus('❌ Camera not ready. Please start camera first.');
            this.hapticFeedback('error');
            return;
        }
        
        try {
            this.updateStatus('📖 Reading text...');
            this.hapticFeedback('short');
            
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            this.ctx.drawImage(this.video, 0, 0);
            
            const imageData = this.canvas.toDataURL('image/jpeg', 0.8);
            const base64Data = imageData.split(',')[1];
            
            const visionData = await this.callGoogleVisionAPI(base64Data, ['TEXT_DETECTION', 'DOCUMENT_TEXT_DETECTION']);
            
            if (visionData && visionData.responses && visionData.responses[0]) {
                this.processTextAnalysis(visionData);
            } else {
                this.updateStatus('❌ Text reading failed. Please try again.');
                this.hapticFeedback('error');
            }
            
        } catch (error) {
            console.error('Text reading error:', error);
            this.updateStatus('❌ Text reading failed. Please try again.');
            this.hapticFeedback('error');
        }
    }
    
    async callGoogleVisionAPI(imageData, features) {
        const request = {
            requests: [{
                image: {
                    content: imageData
                },
                features: features.map(feature => ({ type: feature, maxResults: 10 }))
            }]
        };
        
        const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        });
        
        if (!response.ok) {
            throw new Error(`Vision API error: ${response.status}`);
        }
        
        return await response.json();
    }
    
    processVisionResults(visionData) {
        const response = visionData.responses[0];
        let description = '';
        
        // Process labels
        if (response.labelAnnotations) {
            const labels = response.labelAnnotations.slice(0, 5).map(label => label.description);
            description += `I can see: ${labels.join(', ')}. `;
        }
        
        // Process objects
        if (response.localizedObjectAnnotations) {
            const objects = response.localizedObjectAnnotations.slice(0, 3).map(obj => obj.name);
            if (objects.length > 0) {
                description += `Objects detected: ${objects.join(', ')}. `;
            }
        }
        
        // Process text
        if (response.textAnnotations && response.textAnnotations.length > 0) {
            const text = response.textAnnotations[0].description;
            if (text.length > 0) {
                description += `Text found: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}. `;
            }
        }
        
        if (description === '') {
            description = 'I can see the scene but no specific objects or text were detected.';
        }
        
        this.updateDescription(description);
        this.speakText(description);
        this.updateCameraStats(visionData);
        this.drawObjectBoxes(visionData);
        this.hapticFeedback('success');
        this.playAudioBeacon('success');
        this.updateStatus('✅ Analysis complete');
    }
    
    processColorAnalysis(visionData) {
        const response = visionData.responses[0];
        let colorDescription = '';
        
        if (response.imagePropertiesAnnotation && response.imagePropertiesAnnotation.dominantColors) {
            const colors = response.imagePropertiesAnnotation.dominantColors.colors.slice(0, 5);
            const colorNames = colors.map(color => {
                const rgb = color.color;
                return this.getColorName(rgb.red, rgb.green, rgb.blue);
            });
            
            colorDescription = `The dominant colors I see are: ${colorNames.join(', ')}.`;
        } else {
            colorDescription = 'I cannot determine the colors in this scene.';
        }
        
        this.updateDescription(colorDescription);
        this.speakText(colorDescription);
        this.hapticFeedback('success');
        this.playAudioBeacon('success');
        this.updateStatus('✅ Color analysis complete');
    }
    
    processTextAnalysis(visionData) {
        const response = visionData.responses[0];
        let textDescription = '';
        
        if (response.textAnnotations && response.textAnnotations.length > 0) {
            const fullText = response.textAnnotations[0].description;
            textDescription = `I can read the following text: ${fullText}`;
        } else {
            textDescription = 'No text was detected in this scene.';
        }
        
        this.updateDescription(textDescription);
        this.speakText(textDescription);
        this.hapticFeedback('success');
        this.playAudioBeacon('success');
        this.updateStatus('✅ Text reading complete');
    }
    
    getColorName(r, g, b) {
        const colors = [
            { name: 'red', r: 255, g: 0, b: 0 },
            { name: 'green', r: 0, g: 255, b: 0 },
            { name: 'blue', r: 0, g: 0, b: 255 },
            { name: 'yellow', r: 255, g: 255, b: 0 },
            { name: 'orange', r: 255, g: 165, b: 0 },
            { name: 'purple', r: 128, g: 0, b: 128 },
            { name: 'pink', r: 255, g: 192, b: 203 },
            { name: 'brown', r: 165, g: 42, b: 42 },
            { name: 'black', r: 0, g: 0, b: 0 },
            { name: 'white', r: 255, g: 255, b: 255 },
            { name: 'gray', r: 128, g: 128, b: 128 }
        ];
        
        let closestColor = colors[0];
        let minDistance = this.colorDistance(r, g, b, closestColor.r, closestColor.g, closestColor.b);
        
        for (let i = 1; i < colors.length; i++) {
            const distance = this.colorDistance(r, g, b, colors[i].r, colors[i].g, colors[i].b);
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = colors[i];
            }
        }
        
        return closestColor.name;
    }
    
    colorDistance(r1, g1, b1, r2, g2, b2) {
        return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
    }
    
    repeatLastResponse() {
        const description = document.getElementById('description').textContent;
        if (description && description !== 'Descriptions will appear here...') {
            this.speakText(description);
            this.hapticFeedback('short');
            this.updateStatus('🔄 Repeating last response');
        } else {
            this.updateStatus('❌ No previous response to repeat');
            this.hapticFeedback('error');
        }
    }
    
    updateStatus(message) {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message;
        }
        console.log('Status:', message);
    }
    
    updateDescription(description) {
        const descElement = document.getElementById('description');
        if (descElement) {
            descElement.textContent = description;
        }
    }
    
    checkAPIKeys() {
        if (GOOGLE_VISION_API_KEY.includes('YOUR_') || GOOGLE_VISION_API_KEY === '') {
            console.warn('Google Vision API key not configured');
            this.updateStatus('⚠️ Google Vision API key not configured. Some features may not work.');
        }
        
        if (ELEVENLABS_API_KEY.includes('YOUR_') || ELEVENLABS_API_KEY === '') {
            console.warn('ElevenLabs API key not configured');
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.voiceEyesApp = new VoiceEyesPro();
});
