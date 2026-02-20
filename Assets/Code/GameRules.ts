import { Airship } from "@Easy/Core/Shared/Airship";
import { CharacterCameraMode } from "@Easy/Core/Shared/Character/LocalCharacter/CharacterCameraMode";
import { Game } from "@Easy/Core/Shared/Game";
import { Mouse } from "@Easy/Core/Shared/UserInput/Mouse";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class GameRules extends AirshipBehaviour {

	private bin = new Bin();

	override Start(): void {
		print("Hello, World! from GameRules!");
		
		if (Game.IsClient()) {
			
			// Prevent the mouse from being locked
			this.bin.Add(() => {
				Mouse.ClearAllUnlockers();
			});

			// Airship.Camera.SetMode(CharacterCameraMode.Fixed);
			Airship.Camera.SetEnabled(false);
			Mouse.SetCursorVisible(true);
		}
		
	}
}
