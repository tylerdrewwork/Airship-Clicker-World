import { Platform } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { AirshipNetworkBehaviour } from "@Easy/Core/Shared/Network/AirshipNetworkBehaviour";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import { Command } from "@Easy/Core/Shared/Network/ServerRpc";
import { Player } from "@Easy/Core/Shared/Player/Player";

export default class ScoreKeeper extends AirshipBehaviour {

	private static readonly GLOBAL_CLICK_DATA_KEY = `Clicks-Global`;
	private readonly clicksInBatch = 0;

	private addClicks = new NetworkSignal<{ clicks: number }>("AddClicks");


	override Start(): void {
		print("Hello, World! from ScoreKeeper!");

		if (Game.IsServer()) {
			this.addClicks.server.OnClientEvent((player, event) => {
				this.AddScoreToDataStoreInBatch(player, event.clicks);
			})
		}
	}

	public AddClicks(clicks: number): void {
		this.RequestAddClicks(clicks);
	}

	public RequestAddClicks(clickAmt: number): void {
		if (!Game.IsClient()) return;

		// Client -> Server
		// Network Signal 
		this.addClicks.client.FireServer({ clicks: clickAmt });
	}

	@Server()
	private async AddScoreToDataStoreInBatch(player : Player, clicksAmt : number) {
		if (!Game.IsServer()) return;

		const playerClickDataKey = `Clicks-Player:${player.userId}`;

		// Get from datastore
		const clicksGlobal = await Platform.Server.DataStore.GetKey<GlobalClickData>(
			ScoreKeeper.GLOBAL_CLICK_DATA_KEY,
		);
		let globalCurrentClicks = 0;
		if (clicksGlobal) globalCurrentClicks = clicksGlobal.clicks;

		const clicksPlayer = await Platform.Server.DataStore.GetKey<PlayerClickData>(playerClickDataKey);
		let playerCurrentClicks = 0; // init at 0 to create new key if needed
		if (clicksPlayer) playerCurrentClicks = clicksPlayer.clicks;

		// Set datastore
		const playerClickData: PlayerClickData = {
			clicks: playerCurrentClicks + clicksAmt,
		};
		const globalClickData: GlobalClickData = {
			clicks: globalCurrentClicks + clicksAmt
		}

		await Platform.Server.DataStore.SetKey(playerClickDataKey, playerClickData);
		await Platform.Server.DataStore.SetKey(ScoreKeeper.GLOBAL_CLICK_DATA_KEY, globalClickData);
	}
}

export class GlobalClickData {
	clicks: number;
}

export class PlayerClickData {
	clicks: number;
}
