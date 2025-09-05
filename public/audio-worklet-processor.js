class ResampleProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = [];
    this._inRate = sampleRate; // sampleRate del AudioContext
    this._outRate = 16000; // objetivo para Google AI
  }

  _floatTo16BitPCM(float32Array) {
    const out = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const float32 = input[0];

    // Simple nearest-neighbor downsample (se puede mejorar con filtro antialiasing)
    const ratio = this._inRate / this._outRate;
    const outLen = Math.floor(float32.length / ratio);
    const out = new Int16Array(outLen);
    
    for (let i = 0; i < outLen; i++) {
      const idx = Math.floor(i * ratio);
      const s = Math.max(-1, Math.min(1, float32[idx]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    // Postea al main thread como ArrayBuffer
    this.port.postMessage(out.buffer, [out.buffer]);
    return true;
  }
}

registerProcessor('resample-processor', ResampleProcessor);
