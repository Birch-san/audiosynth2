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

// const 

export default class AudioSynth {
  *generate(): IterableIterator<number> {
    // var frequency = this._notes[note] * Math.pow(2,octave-4);
    // var sampleRate = this._sampleRate;
    // var volume = this._volume;
    // var channels = this._channels;
    // var bitsPerSample = this._bitsPerSample;
    // var attack = thisSound.attack(sampleRate, frequency, volume);
    // var dampen = thisSound.dampen(sampleRate, frequency, volume);
    // var waveFunc = thisSound.wave;
    // var waveBind = {modulate: this._mod, vars: this._temp};
    // var val = 0;
    // var curVol = 0;

    // var data = new Uint8Array(new ArrayBuffer(Math.ceil(sampleRate * time * 2)));
    // var attackLen = (sampleRate * attack) | 0;
    // var decayLen = (sampleRate * time) | 0;

    // for (var i = 0 | 0; i !== attackLen; i++) {
  
    //   val = volume * (i/(sampleRate*attack)) * waveFunc.call(waveBind, i, sampleRate, frequency, volume);

    //   data[i << 1] = val;
    //   data[(i << 1) + 1] = val >> 8;

    // }

    // for (; i !== decayLen; i++) {

    //   val = volume * Math.pow((1-((i-(sampleRate*attack))/(sampleRate*(time-attack)))),dampen) * waveFunc.call(waveBind, i, sampleRate, frequency, volume);

    //   data[i << 1] = val;
    //   data[(i << 1) + 1] = val >> 8;

    // }

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
