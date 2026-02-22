import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { Mouse } from "@Easy/Core/Shared/UserInput/Mouse";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import ScoreKeeper from "./Gameplay/ScoreKeeper";
import ClickVisuals from './Gameplay/ClickVisuals';
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";

export default class GameRules extends AirshipSingleton {

	public scoreKeeper: ScoreKeeper;
	public clickVisuals: ClickVisuals;

	public possibleColors: Color[];

	public mainCamera: Camera;
	
	private bin = new Bin();

	// TODO move this to a better place, putting it here because I'm trying to finish this project this weekend
	public onCustomCharacterInstantiated = new NetworkSignal<{color: Color}>("OnCustomCharacterInstantiated");
	public syncCustomCharacterColors = new NetworkSignal<{color: Color, userId: string, username: string}>("SyncCustomCharacterColors");

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
