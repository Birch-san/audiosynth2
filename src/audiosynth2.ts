// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
  // import "core-js/fn/array.find"
  // ...

export interface IVoice {

}

const pack = function(c: number, arg: number) {
  return [
  new Uint8Array([arg, arg >> 8]),
  new Uint8Array([arg, arg >> 8, arg >> 16, arg >> 24])
  ][c];
};

export type EnvelopeFunc
= (
  sampleRate: number,
  frequency: number,
  volume: number,
  ) => number;

// export type WaveFunc
// = (
//   i: number,
//   sampleRate: number,
//   frequency: number,
//   volume: number,
//   ) => number;

export interface WaveInput {
  sampleIx: number,
  sampleRate: number,
  frequency: number,
  volume: number,
  modulators: WaveModulator[],
  vars: { [key: string]: any},
}

export type WaveFunc
= (input: WaveInput) => number;

export type WaveModulator
= (
  sampleIx: number,
  sampleRate: number,
  frequency: number,
  x: number,
  ) => number;

export interface IVoiceProfile {
  name: string;
  attack: EnvelopeFunc;
  dampen: EnvelopeFunc;
  wave: WaveFunc;
}

export interface IAudioSynthOptions {
  ctx: AudioContext;
  bitsPerSample?: number;
  channels?: number;
}

export type VoiceFactory
= (frequency: number) => Voice;

export class AudioSynth {
  private readonly ctx: AudioContext;
  private readonly bitsPerSample: number;
  private readonly channels: number;
  constructor({
    ctx,
    bitsPerSample = 16,
    channels = 1,
  }: IAudioSynthOptions) {
    this.ctx = ctx;
    this.bitsPerSample = bitsPerSample;
    this.channels = channels;
  }
  makeVoiceFactory(profile: IVoiceProfile): VoiceFactory {
    return this.makeVoice.bind(this, profile);
  }
  makeVoice(
    profile: IVoiceProfile,
    frequency: number,
    ): Voice {
    // const processorNode = this.ctx.createScriptProcessor(undefined /* consider non-zero on WebKit */, 0, this.channels);
    // processorNode.connect(this.ctx.destination);
    return new Voice({
      profile,
      frequency,
      sampleRate: this.ctx.sampleRate,
      bitsPerSample: this.bitsPerSample,
      channels: this.channels,
    })
  }
}

export interface IVoiceOptions {
  profile: IVoiceProfile;
  sampleRate: number;
  frequency: number;
  bitsPerSample?: number;
  channels?: number;
  volume?: number;
}

/**
 * Note to self: article on how to do audio effects
 * {@link https://noisehack.com/custom-audio-effects-javascript-web-audio-api/}
 **/

export const getScriptProcessor = (ctx: AudioContext, voice: Voice) => {
  const samples = voice.generate();
  const processorNode: ScriptProcessorNode = ctx.createScriptProcessor(0 /* consider non-zero on WebKit */, 0, voice.channels);
  processorNode.connect(ctx.destination);
  processorNode.onaudioprocess = (event: AudioProcessingEvent) => {
    const out: Float32Array = event.outputBuffer.getChannelData(0);
    for (let i = 0; i < out.length; i++ ) {
      const result: IteratorResult<number> = samples.next();
      if (result.done) {
        processorNode.disconnect();
        processorNode.onaudioprocess = null;
        break;
      }
      // const val = Math.floor(result.value);
      out[i] = result.value;
      // out[i << 1] = val;
      // out[(i << 1) + 1] = val >> 8;
    }
  };
}

export class Voice {
  private readonly profile: IVoiceProfile;
  private readonly sampleRate: number;
  private readonly frequency: number;
  private readonly bitsPerSample: number;
  public readonly channels: number;
  private readonly volume: number;

  constructor({
    profile,
    sampleRate,
    frequency,
    bitsPerSample = 16,
    channels = 1,
    volume = 1,
  }: IVoiceOptions) {
    this.profile = profile;
    this.sampleRate = sampleRate;
    this.frequency = frequency;
    this.bitsPerSample = bitsPerSample;
    this.channels = channels;
    this.volume = volume;
  }

  *generate(): IterableIterator<number> {
    // var frequency = this._notes[note] * Math.pow(2,octave-4);
    // var sampleRate = this._sampleRate;
    // var volume = this._volume;
    // var channels = this._channels;
    // var bitsPerSample = this._bitsPerSample;
    const duration: string|undefined = undefined;
    const time = duration
    ? parseFloat(duration)
    : 2;

    const attack = this.profile.attack(this.sampleRate, this.frequency, this.volume);
    const dampen = this.profile.dampen(this.sampleRate, this.frequency, this.volume);
    const waveFunc = this.profile.wave;
    // const waveMod: WaveModulator = 
    const modulators: WaveModulator[]
    = [1, 0.5].flatMap((coefficient: number): WaveModulator[] =>
      [2, 4, 8, .5, .25].map((theta: number): WaveModulator =>
        (sampleIx, sampleRate, frequency, x) =>
        coefficient * Math.sin(theta * Math.PI * sampleIx / sampleRate * frequency + x)));
    const vars = {};
    // const waveBind = {modulate: [waveMod], vars: {}};
    let val = 0;
    // let curVol = 0;

    const data = new Uint8Array(new ArrayBuffer(Math.ceil(this.sampleRate * time * 2)));
    const attackLen = (this.sampleRate * attack) | 0;
    const decayLen = (this.sampleRate * time) | 0;

    let sampleIx = 0;
    for (; sampleIx < attackLen; sampleIx++) {
  
      val = this.volume
      * sampleIx
      / this.sampleRate
      * attack
      * waveFunc({
        sampleIx,
        sampleRate: this.sampleRate,
        frequency: this.frequency,
        volume: this.volume,
        modulators,
        vars
      });

      data[sampleIx << 1] = val*32768;
      data[(sampleIx << 1) + 1] = (val*32768) >> 8;

      yield val;
    }

    for (; sampleIx < decayLen; sampleIx++) {

      val = this.volume
      * (1-
          (sampleIx - this.sampleRate * attack)
          /(this.sampleRate * (time - attack)))
      ** dampen
      * waveFunc({
        sampleIx,
        sampleRate: this.sampleRate,
        frequency: this.frequency,
        volume: this.volume,
        modulators,
        vars
      });

      data[sampleIx << 1] = val*32768;
      data[(sampleIx << 1) + 1] = (val*32768) >> 8;
      
      yield val;
    }

    console.log(data)

    // var out = [
    //   'RIFF',
    //   pack(1, 4 + (8 + 24/* chunk 1 length */) + (8 + 8/* chunk 2 length */)), // Length
    //   'WAVE',
    //   // chunk 1
    //   'fmt ', // Sub-chunk identifier
    //   pack(1, 16), // Chunk length
    //   pack(0, 1), // Audio format (1 is linear quantization)
    //   pack(0, channels),
    //   pack(1, sampleRate),
    //   pack(1, sampleRate * channels * bitsPerSample / 8), // Byte rate
    //   pack(0, channels * bitsPerSample / 8),
    //   pack(0, bitsPerSample),
    //   // chunk 2
    //   'data', // Sub-chunk identifier
    //   pack(1, data.length * channels * bitsPerSample / 8), // Chunk length
    //   data
    // ];
    // var blob = new Blob(out, {type: 'audio/wav'});
    // var dataURI = URL.createObjectURL(blob);
    // this._fileCache[sound][octave-1][note][time] = dataURI;
    // if(this._debug) { console.log((new Date).valueOf() - t, 'ms to generate'); }
    // return dataURI;
  }
}

export const voiceProfiles: Record<'piano', IVoiceProfile> = {
  piano: {
    name: 'piano',
    attack: () => 0.002,
    dampen: (sampleRate, frequency, volume) => 
    (0.5 * Math.log(frequency * volume / sampleRate)) ** 2,
    wave: ({
      sampleIx,
      sampleRate,
      frequency,
      volume,
      modulators,
      vars,
    }: WaveInput): number => {
      const base = modulators[0];
      return base(
        sampleIx,
        sampleRate,
        frequency,
        base(sampleIx, sampleRate, frequency, 0) ** 2
        + 0.75 * base(sampleIx, sampleRate, frequency, 0.25)
        + 0.1 * base(sampleIx, sampleRate, frequency, 0.5));
    }
  }
}