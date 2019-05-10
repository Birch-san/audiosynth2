import Pluck from '/dist/esm/index.mjs'

const ctx = new AudioContext()
// pluck = new Pluck2();
// pluck.play( 220 );
ctx.audioWorklet.addModule('/dist/esm/karplus-strong.mjs')
.then((x) => {
  console.log(x)
  })

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