import GameRules from "Code/GameRules";

export default class MainButton extends AirshipBehaviour {

	override Start(): void {
		const gameRules = GameRules.Get();

		const button = gameObject.GetComponent<Button>();
		if (button) {
			button.onClick.Connect(() => {
				if (!gameRules.scoreKeeper.isAutoClicking) {
					gameRules.scoreKeeper.AddClickLocal();
				}
			});
		}
	}
}
