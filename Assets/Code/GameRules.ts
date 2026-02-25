import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { Mouse } from "@Easy/Core/Shared/UserInput/Mouse";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import ScoreKeeper from "./Gameplay/ScoreKeeper";
import ClickVisuals from './Gameplay/ClickVisuals';
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import CustomCharacterController from "./Gameplay/CustomCharacterController";

export default class GameRules extends AirshipSingleton {

	public scoreKeeper: ScoreKeeper;
	public clickVisuals: ClickVisuals;

	public possibleColors: Color[];

	public mainCamera: Camera;

	private bin = new Bin();

	// TODO move this to a better place, putting it here because I'm trying to finish this project this weekend
	public onCustomCharacterInstantiated = new NetworkSignal<{}>("OnCustomCharacterInstantiated");
	public syncCustomCharacterColors = new NetworkSignal<{ color: Color, userId: string, username: string }>("SyncCustomCharacterColors");

	override Start(): void {

		if (Game.IsClient()) {
			// Prevent the mouse from being locked
			this.bin.Add(() => {
				Mouse.ClearAllUnlockers();
			});

			Airship.Camera.SetEnabled(false);
			// Mouse.SetCursorVisible(false);

			Mouse.AddUnlocker();
		}

		if (Game.IsServer()) {
			let onCustomCharacterInitialized = GameRules.Get().onCustomCharacterInstantiated;
			// send character info to other players on client character initialize
			onCustomCharacterInitialized.server.OnClientEvent((player, event) => {
				print("Player Character initialized. Username: " + player.username);

				let pchar = player.character?.gameObject.GetAirshipComponent<CustomCharacterController>();
				if (pchar) {

					if (!pchar.cursorColor || pchar.cursorColor.a === 0) {
						let randomColorIndex = math.random(0, GameRules.Get().possibleColors.size() - 1);
						let color = GameRules.Get().possibleColors[randomColorIndex];
						pchar.cursorColor = color;
					}

					GameRules.Get().syncCustomCharacterColors.server.FireAllClients({
						color: pchar.cursorColor,
						userId: player.userId,
						username: player.username
					})
				}
			});
		}
	}
}
