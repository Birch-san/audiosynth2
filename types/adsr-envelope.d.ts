export = ADSREnvelope;
type Curve = "lin"|"exp";
interface ADSREnvelopeOpts {
  attackTime?: number;
  decayTime?: number;
  sustainLevel?: number;
  releaseTime?: number;
  gateTime?: number;
  sustainTime?: number; // no default documented
  duration?: number;    // no default documented
  peakLevel?: number;
  epsilon?: number;
  attackCurve?: Curve;
  decayCurve?: Curve;
  releaseCurve?: Curve;
}
declare class ADSREnvelope {
  constructor(opts: ADSREnvelopeOpts);
  applyTo(audioParam: AudioParam, playbackTime?: number): ADSREnvelope;
  clone(): ADSREnvelope;
  getWebAudioAPIMethods(playbackTime?: number): any[];
  valueAt(time: number): number;

  duration: number;
  attackTime: number;
  decayTime: number;
  sustainTime: number;
  sustainLevel: number;
  releaseTime: number;
  gateTime: number;
  peakLevel: number;
  epsilon: number;
  attackCurve: string;
  decayCurve: string;
  releaseCurve: string;
}
