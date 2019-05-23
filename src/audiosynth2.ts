import ADSREnvelope from 'adsr-envelope'

// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

export interface IVoice {}

const pack = function(c: number, arg: number) {
  return [new Uint8Array([arg, arg >> 8]), new Uint8Array([arg, arg >> 8, arg >> 16, arg >> 24])][c]
}

export interface EnvelopeInput {
  sampleRate: number
  frequency: number
  volume: number
}

export type EnvelopeFunc = (input: EnvelopeInput) => number

// export type WaveFunc
// = (
//   i: number,
//   sampleRate: number,
//   frequency: number,
//   volume: number,
//   ) => number;

export interface WaveInput {
  sampleIx: number
  sampleRate: number
  frequency: number
  volume: number
  modulators: WaveModulator[]
  vars: { [key: string]: any }
}

export type WaveFunc = (input: WaveInput) => number

export interface ModulatorInput {
  sampleIx: number
  sampleRate: number
  frequency: number
  x: number
}

export type WaveModulator = (input: ModulatorInput) => number

export interface IVoiceProfile {
  name: string
  attack: EnvelopeFunc
  dampen: EnvelopeFunc
  wave: WaveFunc
  envelope: ADSREnvelope
}

export interface IAudioSynthOptions {
  ctx: AudioContext
  bitsPerSample?: number
  channels?: number
}

export type VoiceFactory = (frequency: number) => Voice

export class AudioSynth {
  private readonly ctx: AudioContext
  private readonly bitsPerSample: number
  private readonly channels: number
  constructor({ ctx, bitsPerSample = 16, channels = 1 }: IAudioSynthOptions) {
    this.ctx = ctx
    this.bitsPerSample = bitsPerSample
    this.channels = channels
  }
  makeVoiceFactory(profile: IVoiceProfile): VoiceFactory {
    return this.makeVoice.bind(this, profile)
  }
  makeVoice(profile: IVoiceProfile, frequency: number): Voice {
    // const processorNode = this.ctx.createScriptProcessor(undefined /* consider non-zero on WebKit */, 0, this.channels);
    // processorNode.connect(this.ctx.destination);
    return new Voice({
      profile,
      frequency,
      sampleRate: this.ctx.sampleRate,
      bitsPerSample: this.bitsPerSample,
      channels: this.channels
    })
  }
}

export interface IVoiceOptions {
  profile: IVoiceProfile
  sampleRate: number
  frequency: number
  bitsPerSample?: number
  channels?: number
  volume?: number
}

/**
 * Note to self: article on how to do audio effects
 * {@link https://noisehack.com/custom-audio-effects-javascript-web-audio-api/}
 **/

export const getScriptProcessor = (ctx: AudioContext, voice: Voice) => {
  const samples = voice.generate(ctx.currentTime)
  const processorNode: ScriptProcessorNode = ctx.createScriptProcessor(
    0 /* consider non-zero on WebKit */,
    0,
    voice.channels
  )
  processorNode.connect(ctx.destination)
  processorNode.onaudioprocess = (event: AudioProcessingEvent) => {
    const out: Float32Array = event.outputBuffer.getChannelData(0)
    for (let i = 0; i < out.length; i++) {
      const result: IteratorResult<number> = samples.next()
      if (result.done) {
        processorNode.disconnect()
        processorNode.onaudioprocess = null
        break
      }
      // const val = Math.floor(result.value);
      out[i] = result.value
      // out[i << 1] = val;
      // out[(i << 1) + 1] = val >> 8;
    }
  }
}

export type NoteOff = (endTime?: number) => void
export interface ActiveNote {
  noteOff: NoteOff
}

export interface NoteGenerateYieldValue {
  // currentTime: number
  // gateTime: number
  // endTime?: number
  duration: number
}

export class Voice {
  private readonly profile: IVoiceProfile
  private readonly sampleRate: number
  private readonly frequency: number
  private readonly bitsPerSample: number
  public readonly channels: number
  private readonly volume: number
  // private readonly envelope: ADSREnvelope

  constructor({
    profile,
    sampleRate,
    frequency,
    bitsPerSample = 16,
    channels = 1,
    volume = 1
  }: IVoiceOptions) {
    this.profile = profile
    this.sampleRate = sampleRate
    this.frequency = frequency
    this.bitsPerSample = bitsPerSample
    this.channels = channels
    this.volume = volume
    // this.envelope = profile.envelope.clone();
  }

  // get envelope(): ADSREnvelope {
  //   return this._envelope
  // }

  playUntil(ctx: AudioContext, endTime: number) {
    this.playFromUntil(ctx, undefined, endTime)
  }

  playFor(ctx: AudioContext, durationSecs: number) {
    this.playFromFor(ctx, undefined, durationSecs)
  }

  playFromUntil(ctx: AudioContext, startTime: number = ctx.currentTime, endTime: number) {
    const activeNote = this.noteOn(ctx, startTime)
    activeNote.noteOff(endTime)
  }

  playFromFor(ctx: AudioContext, startTime: number = ctx.currentTime, durationSecs: number) {
    const endTime = startTime + durationSecs
    this.playFromUntil(ctx, startTime, endTime)
  }

  noteOn(ctx: AudioContext, startTime: number = ctx.currentTime): ActiveNote {
    // const startTime = ctx.currentTime
    // let [gateTime, endTime] = [Infinity, Infinity]
    let duration = Infinity
    const gainNode = ctx.createGain()
    gainNode.connect(ctx.destination)
    const envelope = this.profile.envelope.clone()
    // envelope.gateTime = Infinity;
    envelope.applyTo(gainNode.gain, startTime)

    const samples = this.generate(startTime)
    const processorNode: ScriptProcessorNode = ctx.createScriptProcessor(
      0 /* consider non-zero on WebKit */,
      0,
      this.channels
    )

    processorNode.connect(gainNode)
    processorNode.onaudioprocess = (event: AudioProcessingEvent) => {
      const out: Float32Array = event.outputBuffer.getChannelData(0)
      for (let i = 0; i < out.length; i++) {
        const result: IteratorResult<number> = samples.next({
          // gateTime,
          duration
        } as NoteGenerateYieldValue)
        if (result.done) {
          processorNode.disconnect()
          gainNode.disconnect()
          processorNode.onaudioprocess = null
          break
        }
        // const val = Math.floor(result.value);
        out[i] = result.value
        // out[i << 1] = val;
        // out[(i << 1) + 1] = val >> 8;
      }
    }

    return {
      noteOff: (endTime: number = ctx.currentTime) => {
        // const endTime = ctx.currentTime
        gainNode.gain.cancelScheduledValues(startTime)
        envelope.gateTime = endTime - startTime
        // endTime = startTime + envelope.duration
        duration = envelope.duration
        // gainNode.gain.cancelScheduledValues(endTime)
        // envelope.applyTo(gainNode.gain, startTime);
        envelope.applyTo(gainNode.gain, startTime)
      }
    }
  }

  *generate(startTime: number, scheduledEnd: number = Infinity): IterableIterator<number> {
    // var frequency = this._notes[note] * Math.pow(2,octave-4);
    // var sampleRate = this._sampleRate;
    // var volume = this._volume;
    // var channels = this._channels;
    // var bitsPerSample = this._bitsPerSample;
    const duration: string | undefined = undefined
    const time = duration ? parseFloat(duration) : 2

    const attack = this.profile.attack({
      sampleRate: this.sampleRate,
      frequency: this.frequency,
      volume: this.volume
    })
    const dampen = this.profile.dampen({
      sampleRate: this.sampleRate,
      frequency: this.frequency,
      volume: this.volume
    })
    const waveFunc = this.profile.wave
    // const waveMod: WaveModulator =
    const modulators: WaveModulator[] = [1, 0.5].flatMap(
      (coefficient: number): WaveModulator[] =>
        [2, 4, 8, 0.5, 0.25].map(
          (theta: number): WaveModulator => ({ sampleIx, sampleRate, frequency, x }) =>
            coefficient * Math.sin(((theta * Math.PI * sampleIx) / sampleRate) * frequency + x)
        )
    )
    const vars = {}
    // const waveBind = {modulate: [waveMod], vars: {}};
    let val = 0
    // let curVol = 0;

    // const data = new Uint8Array(new ArrayBuffer(Math.ceil(this.sampleRate * time * 2)))
    // 44000 * 0.00
    const attackLen = (this.sampleRate * attack) | 0
    const decayLen = (this.sampleRate * time) | 0

    let currentTime, gateTime
    let sampleIx = 0
    // for (; sampleIx < attackLen; sampleIx++) {
    for (; ; sampleIx++) {
      // (0*0.002)/44000
      // (1*0.002)/44000

      val = waveFunc({
        sampleIx,
        sampleRate: this.sampleRate,
        frequency: this.frequency,
        volume: this.volume,
        modulators,
        vars
      })

      // data[sampleIx << 1] = val * 32768
      // data[(sampleIx << 1) + 1] = (val * 32768) >> 8

      // yield val
      const { duration }: NoteGenerateYieldValue = yield val
      const timeElapsed = sampleIx / this.sampleRate
      // const currentTime = startTime + timeElapsed
      // if (currentTime >= gateTime) {
      if (timeElapsed >= duration) {
        break
      }
    }

    // for (; sampleIx < decayLen; sampleIx++) {
    //   val = waveFunc({
    //     sampleIx,
    //     sampleRate: this.sampleRate,
    //     frequency: this.frequency,
    //     volume: this.volume,
    //     modulators,
    //     vars
    //   })

    //   data[sampleIx << 1] = val * 32768
    //   data[(sampleIx << 1) + 1] = (val * 32768) >> 8

    //   yield val
    // }

    // console.log(data)

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
    dampen: ({ sampleRate, frequency, volume }) =>
      (0.5 * Math.log((frequency * volume) / sampleRate)) ** 2,
    wave: ({ sampleIx, sampleRate, frequency, volume, modulators, vars }: WaveInput): number => {
      const base = modulators[0]
      return base({
        sampleIx,
        sampleRate,
        frequency,
        x:
          base({ sampleIx, sampleRate, frequency, x: 0 }) ** 2 +
          0.75 * base({ sampleIx, sampleRate, frequency, x: 0.25 }) +
          0.1 * base({ sampleIx, sampleRate, frequency, x: 0.5 })
      })
    },
    envelope: new ADSREnvelope({
      attackTime: 0.01,
      attackCurve: 'exp',
      decayTime: 0.8,
      releaseTime: 0.5,
      releaseCurve: 'exp'
    })
  }
}
