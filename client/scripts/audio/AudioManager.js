// Audio Management System
export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sfxEnabled = true;
        this.musicEnabled = true;
        this.musicOscillators = [];
        this.ambientGain = null;
        this.melodyNotes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C major pentatonic
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        if (this.sfxEnabled) this.playSFX('action');
        return this.sfxEnabled;
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.init();
            this.startAmbientMusic();
        } else {
            this.stopAmbientMusic();
        }
        return this.musicEnabled;
    }

    playSFX(type) {
        if (!this.sfxEnabled || !this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        if (type === 'action') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 600;
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'build') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'capture') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(1000, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        }
    }

    startAmbientMusic() {
        if (!this.musicEnabled || !this.audioContext) return;
        this.stopAmbientMusic();
        const ctx = this.audioContext;

        this.ambientGain = ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.03, ctx.currentTime);
        this.ambientGain.connect(ctx.destination);

        const createPad = (freq, detune = 0) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ambientGain);
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.detune.value = detune;
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            osc.start();
            return osc;
        };

        this.musicOscillators.push(createPad(130.81, -5)); // C3
        this.musicOscillators.push(createPad(164.81, 5)); // E3
        this.musicOscillators.push(createPad(196.0, -3)); // G3

        let noteIndex = 0;
        const playMelodyNote = () => {
            if (!this.musicEnabled) return;

            const noteOsc = ctx.createOscillator();
            const noteGain = ctx.createGain();
            noteOsc.connect(noteGain);
            noteGain.connect(this.ambientGain);

            noteOsc.type = 'sine';
            noteOsc.frequency.value = this.melodyNotes[noteIndex];

            const now = ctx.currentTime;
            noteGain.gain.setValueAtTime(0, now);
            noteGain.gain.linearRampToValueAtTime(0.15, now + 0.1);
            noteGain.gain.exponentialRampToValueAtTime(0.01, now + 2);

            noteOsc.start(now);
            noteOsc.stop(now + 2);

            noteIndex = (noteIndex + 1) % this.melodyNotes.length;
            setTimeout(playMelodyNote, 3000 + Math.random() * 2000);
        };

        setTimeout(playMelodyNote, 1000);
    }

    stopAmbientMusic() {
        this.musicOscillators.forEach(osc => osc.stop());
        this.musicOscillators = [];
        this.ambientGain = null;
    }
}
