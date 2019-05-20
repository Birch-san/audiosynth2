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

  readonly duration: number;
  readonly attackTime: number;
  readonly decayTime: number;
  readonly sustainTime: number;
  readonly sustainLevel: number;
  readonly releaseTime: number;
  readonly gateTime: number;
  readonly peakLevel: number;
  readonly epsilon: number;
  readonly attackCurve: string;
  readonly decayCurve: string;
  readonly releaseCurve: string;
}
