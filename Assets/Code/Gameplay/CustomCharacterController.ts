export default class CustomCharacterController extends AirshipBehaviour {

	public canvasParent: Transform;

	private spawnTime: number;

	override Start(): void {
		this.spawnTime = Time.time;
	}

	override Update(): void {
		// for the first 3 seconds, force transform parent onto the canvasParent
		if (this.canvasParent && Time.time - this.spawnTime < 3) {
			this.transform.parent = this.canvasParent;
		}
	}
}
