//no@ts-check
// <reference path="../dist/types/index.d.ts" />
// import Pluck from '/dist/esm/index.mjs'
// maybe we should just use npm link

import { AudioSynth, voiceProfiles, getScriptProcessor } from '../dist/esm/index.js'

const ctx = new AudioContext()
const synth = new AudioSynth({ctx})
const voiceProfile = voiceProfiles.piano;
const factory = synth.makeVoiceFactory(voiceProfile);
const voice = factory(220);
const generator = voice.generate();
const arr = new Float32Array(100);
for (let i=0; i<100; i++) {
  const generated = generator.next();
  if (generated.done) {
    break;
  }
  arr[i] = generated.value;
}
console.log(arr)
getScriptProcessor(ctx, voice)
// pluck = new Pluck2();
// pluck.play( 220 );
// ctx.audioWorklet.addModule('/dist/esm/karplus-strong.mjs')
// .then((x) => {
//   console.log(x)
//   })



/* 

const workletNode = new AudioWorkletNode(ctx, 'Pluck2')

workletNode.callbacks = {}
workletNode.onmessage = function( event ) {
  console.log(event)
  if( event.data.message === 'return' ) {
    workletNode.callbacks[ event.data.idx ]( event.data.value )
    delete workletNode.callbacks[ event.data.idx ]
  }
}

workletNode.getMemoryValue = function( idx, cb ) {
  this.workletCallbacks[ idx ] = cb
  this.workletNode.port.postMessage({ key:'get', idx })
}
        
workletNode.port.postMessage({ key:'init', memory: new Float32Array(4096) })

workletNode.connect(ctx.destination)
*/