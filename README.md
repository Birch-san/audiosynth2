This project aims to extend the work of Keith William Horwood's https://github.com/keithwhor/audiosynth (a dynamic waveform audio synthesizer). In particular, hoping to enable user to hold down note for as long as they please, rather than pre-determining note duration. A secondary goal is to port the library to TypeScript, and to output an ES Module.

Uses [TypeScript library starter](https://github.com/alexjoverm/typescript-library-starter) as project template.

# Usage

Using ES Modules:

```js
import AudioSynth from 'audiosynth2.mjs'
```

Using tag-loading:

```html
<script type="text/javascript" src="audiosynth2.umd.js"></script>
```

# Demo

See `demo.html`

# Development

Run rollup in watch mode; outputs audiosynth2 to dist folder

```bash
npm start
```