/** Snappy bounce: scale squashes down then springs back. */
const SNAPPY_BOUNCE = (t: number) => {
	if (t < 0.4) return 1 - 0.18 * (t / 0.4); // Quick squash
	if (t < 0.7) return 0.82 + 0.26 * ((t - 0.4) / 0.3); // Fast overshoot
	return 1.08 - 0.08 * ((t - 0.7) / 0.3); // Quick settle to 1
};

export default class BounceTween extends AirshipBehaviour {

	private bounceEndTime = 0;
	private bounceDuration = 0;
	private baseScale = new Vector3(1, 1, 1);
	private easingFn: (t: number) => number = SNAPPY_BOUNCE;

	override Start(): void {}

	/** Bounce the scale. Uses default snappy easing if none provided. */
	public Bounce(duration = 0.15, easing?: (t: number) => number): void {
		this.baseScale = this.transform.localScale;
		this.bounceDuration = duration;
		this.bounceEndTime = Time.timeSinceLevelLoad + duration;
		this.easingFn = easing ?? SNAPPY_BOUNCE;
	}

	override Update(_dt: number): void {
		if (Time.timeSinceLevelLoad >= this.bounceEndTime) {
			if (this.bounceDuration > 0) this.transform.localScale = this.baseScale;
			this.bounceDuration = 0;
			return;
		}

		const t = 1 - (this.bounceEndTime - Time.timeSinceLevelLoad) / this.bounceDuration;
		const scaleMul = this.easingFn(t);
		this.transform.localScale = new Vector3(
			this.baseScale.x * scaleMul,
			this.baseScale.y * scaleMul,
			this.baseScale.z * scaleMul
		);
	}
}
