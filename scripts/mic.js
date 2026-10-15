export class BlowDetector {
  constructor({ onLevel, onError } = {}) {
    this.onLevel = onLevel;
    this.onError = onError;
    this.context = null;
    this.analyser = null;
    this.stream = null;
    this.buffer = null;
    this.monitoring = false;
    this.noiseFloor = 0.018;
  }

  async start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone access is not supported in this browser.");
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: false,
        autoGainControl: false
      }
    });

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.context = this.context || new AudioContextClass();
    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    const source = this.context.createMediaStreamSource(this.stream);
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.55;
    this.buffer = new Uint8Array(this.analyser.fftSize);
    source.connect(this.analyser);
    return true;
  }

  async listenForBlow({ duration = 5200, threshold = 0.11, hold = 150 } = {}) {
    if (!this.analyser) {
      await this.start();
    }

    return new Promise((resolve) => {
      const started = performance.now();
      let loudSince = 0;
      let resolved = false;
      this.monitoring = true;

      const complete = (value) => {
        if (resolved) return;
        resolved = true;
        this.monitoring = false;
        resolve(value);
      };

      const tick = () => {
        if (!this.monitoring) {
          complete(false);
          return;
        }

        const now = performance.now();
        const level = this.getLevel();
        const adaptiveThreshold = Math.max(threshold, this.noiseFloor * 3.1);

        if (level < adaptiveThreshold * 0.75) {
          this.noiseFloor = this.noiseFloor * 0.95 + level * 0.05;
        }

        this.onLevel?.(Math.min(level / adaptiveThreshold, 1.5));

        if (level > adaptiveThreshold) {
          loudSince = loudSince || now;
          if (now - loudSince >= hold) {
            complete(true);
            return;
          }
        } else {
          loudSince = 0;
        }

        if (now - started > duration) {
          complete(false);
          return;
        }

        requestAnimationFrame(tick);
      };

      tick();
    });
  }

  forceResolve() {
    this.monitoring = false;
  }

  stop() {
    this.monitoring = false;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  getLevel() {
    this.analyser.getByteTimeDomainData(this.buffer);
    let sum = 0;

    for (let i = 0; i < this.buffer.length; i += 1) {
      const centered = (this.buffer[i] - 128) / 128;
      sum += centered * centered;
    }

    return Math.sqrt(sum / this.buffer.length);
  }
}
