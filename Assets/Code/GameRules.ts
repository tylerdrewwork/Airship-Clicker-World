import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { Mouse } from "@Easy/Core/Shared/UserInput/Mouse";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import ScoreKeeper from "./Gameplay/ScoreKeeper";

export default class GameRules extends AirshipBehaviour {

	public scoreKeeper: ScoreKeeper;
	
	private bin = new Bin();

	override Start(): void {
		
		if (Game.IsClient()) {
			
			// Prevent the mouse from being locked
			this.bin.Add(() => {
				Mouse.ClearAllUnlockers();
			});

			Airship.Camera.SetEnabled(false);
			Mouse.SetCursorVisible(true);

			Mouse.AddUnlocker();
		}
	}
}
