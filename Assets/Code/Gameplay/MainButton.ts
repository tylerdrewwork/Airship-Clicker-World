import GameRules from "Code/GameRules";

export default class MainButton extends AirshipBehaviour {
	
	public gameRules: GameRules;

	override Start(): void {
		print("Hello, World! from MainButton!");

		const button = gameObject.GetComponent<Button>();
		if (button) {
			button.onClick.Connect(() => {
				print("Button clicked!");
				this.gameRules.scoreKeeper.AddClickLocal(1);
			});
		}
	}
}
