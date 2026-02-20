export default class MainButton extends AirshipBehaviour {
	override Start(): void {
		print("Hello, World! from MainButton!");

		const button = gameObject.GetComponent<Button>();
		if (button) {
			button.onClick.Connect(() => {
				print("Button clicked!");
			});
		}
	}
}
