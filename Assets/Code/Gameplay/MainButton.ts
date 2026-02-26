import GameRules from "Code/GameRules";
import BounceTween from "Code/Utils/BounceTween";

export default class MainButton extends AirshipBehaviour {

	private bounceTween: BounceTween;

	override Start(): void {
		const gameRules = GameRules.Get();
		const button = gameObject.GetComponent<Button>();
		const bounceTween = this.gameObject.GetAirshipComponent<BounceTween>();
		if (bounceTween) this.bounceTween = bounceTween;
		
		if (button) {
			
			button.onClick.Connect(() => {
				if (!gameRules.scoreKeeper.isAutoClicking) {
					gameRules.scoreKeeper.AddClickLocal();
					if (bounceTween) this.bounceTween.Bounce();
				}
			});
		}

		

	}
}
