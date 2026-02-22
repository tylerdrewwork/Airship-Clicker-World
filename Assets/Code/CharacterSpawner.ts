import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import CustomCharacterController from "./Gameplay/CustomCharacterController";
import GameRules from './GameRules';

export default class CharacterSpawner extends AirshipBehaviour {
	public spawnParent : GameObject; // where to spawn the players

	override Start(): void {
		if (Game.IsServer()) {
			// Fired when players join the game
			Airship.Players.ObservePlayers((player) => {
				print("TESTAAAA")
				let char : Character = player.SpawnCharacter(this.transform.position, {
					lookDirection: this.transform.forward,
				});
			});

			// Respawn characters when they die
			// Airship.Damage.onDeath.Connect((damageInfo) => {
			// 	const character = damageInfo.gameObject.GetAirshipComponent<Character>();
			// 	character?.Despawn();
			// 	if (character?.player) {
			// 		character.player.SpawnCharacter(this.transform.position, {
			// 			lookDirection: this.transform.forward,
			// 		});
			// 	}
			// });
		}

		if (Game.IsClient()) {
			Airship.Players.ObservePlayers((player) => {
				player.WaitForCharacter();

				if (player.character) {
					let canvas = player.character.gameObject.GetComponentInChildren<Canvas>();
					if (canvas) canvas.worldCamera = GameRules.Get().mainCamera;
				}
			});
		}
	}
}
