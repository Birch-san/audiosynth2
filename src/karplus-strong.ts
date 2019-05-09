/**
 * Missing from TypeScript library
 * @author teali
 * @see {@link https://github.com/Microsoft/TypeScript/issues/28308}
 */
interface AudioWorkletProcessor {
    readonly port: MessagePort;
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Map<string, Float32Array>): void;
}

declare var AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor;
    new(options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
}

/**
 * Ported to TypeScript.
 * Based on @author Kevin Ennis
 * @see {@link https://gist.github.com/kevincennis/6059128}
 * and @author Grumdrig
 * @see {@link https://stackoverflow.com/a/14487961/5257399}
 */
export class Pluck {
  private readonly freq: number;
  private readonly sampleRate: number;
  private processorNode: ScriptProcessorNode;
  private playing: boolean = false;

  constructor(ctx: AudioContext) {
    this.freq = 440;
    this.sampleRate = ctx.sampleRate;
    this.processorNode = ctx.createScriptProcessor( 0 /* consider non-zero on WebKit */, 0, 1 );
    this.processorNode.connect( ctx.destination );
  }

  play() {
    let N = Math.round( this.sampleRate / this.freq );
    let impulse = this.sampleRate / 1000;
    let n = 0;
    const y = new Float32Array( N );
    this.processorNode.onaudioprocess = ( event: AudioProcessingEvent ) => {
      const out: Float32Array = event.outputBuffer.getChannelData( 0 );
      let i = 0;
      let xn;
      for ( ; i < out.length; ++i ) {
        xn = ( --impulse >= 0 )
        ? Math.random() - 0.5
        : 0;
        out[ i ] = y[ n ] = xn + ( y[ n ] + y[ ( n + 1 ) % N ] ) / 2;
        if ( ++n >= N
          || !this.playing ) {
          n = 0;
        }
      }
    };
    this.playing = true;
  }

  // private processBlock(e: AudioProcessingEvent) {

  // }

  pause() {
    this.playing = false;
  }
}

interface IPluckMessageEvent extends MessageEvent {
  data: PluckMessageData;
}
type PluckMessageKey = 'init'|'set'|'get';
interface IPluckMessageData {
  key: PluckMessageKey;
}
interface IPluckMessageDataInit extends IPluckMessageData {
  key: 'init';
  memory: Float32Array;
}
interface IPluckMessageDataSet extends IPluckMessageData {
  key: 'set';
  idx: number;
  value: number;
}
interface IPluckMessageDataGet extends IPluckMessageData {
  key: 'get';
  idx: number;
}
type PluckMessageData
= IPluckMessageDataInit
| IPluckMessageDataSet
| IPluckMessageDataGet;

/**
 * Looks like Firefox doesn't yet support audio worklets (or at least: AudioWorkletGlobalScope#registerProcessor)
 * 
 * Based on Genish.js utility by @author Charlie Roberts
 * @see {@link https://github.com/charlieroberts/genish.js}
 * @see {@link https://hoch.io/assets/publications/icmc-2018-choi-audioworklet.pdf}
 */
export class Pluck2 extends AudioWorkletProcessor {
  private initialized: boolean = false;
  private memory?: Float32Array;
  constructor( options: AudioWorkletNodeOptions ) {
    super( options )
    this.port.onmessage = this.handleMessage//.bind( this )
    this.initialized = false
  }

  private handleMessage( event: IPluckMessageEvent ) {
    console.log(event);
    if( event.data.key === 'init' ) {
      this.memory = event.data.memory
      this.initialized = true
    } else if( event.data.key === 'set' ) {
      if (this.memory) {
        this.memory[ event.data.idx ] = event.data.value
      }
    } else if( event.data.key === 'get' ) {
      if (this.memory) {
        this.port.postMessage({ key:'return', idx:event.data.idx, value: this.memory[event.data.idx] })
      }
    }
  }

  process( inputs: any, outputs: any, parameters: any ) {
    console.log(inputs)
    if( this.initialized === true ) {
      const output = outputs[0]
      const left   = output[ 0 ]
      const right  = output[ 1 ]
      const len    = left.length
      // const memory = this.memory ${parameterDereferences}${inputDereferences}${memberString}
      // for( let i = 0; i < len; ++i ) {
      //   ${prettyCallback}
      //   ${genishOutputLine}
      // }
    }
    return true
  }
}

// usage:

// var ctx = new AudioContext(),
//   pluck = new Pluck( ctx );
// pluck.play( 220 );