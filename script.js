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
    
    // Continue with more methods...
    // [Additional methods will be added in the next part]
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.voiceEyesApp = new VoiceEyesPro();
});
