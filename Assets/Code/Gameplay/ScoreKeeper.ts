import { Platform } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { AirshipNetworkBehaviour } from "@Easy/Core/Shared/Network/AirshipNetworkBehaviour";
import { NetworkFunction } from "@Easy/Core/Shared/Network/NetworkFunction";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import { Command } from "@Easy/Core/Shared/Network/ServerRpc";
import { Player } from "@Easy/Core/Shared/Player/Player";

export default class ScoreKeeper extends AirshipBehaviour {

	private static readonly GLOBAL_CLICK_DATA_KEY = `Clicks-Global`;
	private clicksInBatch = 0;
	private lastBatchTime = 0;
	/// Every `BATCH_INTERVAL` seconds the score will update from the datastore
	private static readonly BATCH_INTERVAL = 5; // In Seconds

	// NetworkFunction's generics:
	// first generic argument is the object that the client fires to the server
	// second generic argument is the object that is returned via callback
	private addClicks = new NetworkFunction<{ clicks: number }, GlobalClickData>("AddClicks");


	override Start(): void {
		print("Hello, World! from ScoreKeeper!");

		if (Game.IsServer()) {
			this.addClicks.server.SetCallback((player, event) => {
				let clicksResult = 0;
				
				// 
				this.S_AddScoreToDataStoreInBatch(player, event.clicks).then(res => {
					if (res) clicksResult = res.clicks;
				});

				// NetworkFunction needs a GlobalClickData
				return {
					clicks: clicksResult
				}
			})
		}
	}

	override Update(): void {
		// run every 5 seconds
		if (Game.IsClient() && Time.timeSinceLevelLoad - this.lastBatchTime >= ScoreKeeper.BATCH_INTERVAL) {
			this.lastBatchTime = Time.timeSinceLevelLoad;
			this.C_RequestAddClicks();
			
		}
	}

	public AddClickLocal(clicks: number): void {
		this.clicksInBatch++;
	}

	public C_RequestAddClicks(): void {
		if (!Game.IsClient()) return;

		// Client -> Server
		// Network Signal 
		let newGlobalClicks = this.addClicks.client.FireServer({ clicks: this.clicksInBatch });
		this.clicksInBatch = 0;
	}

	@Server()
	private async S_AddScoreToDataStoreInBatch(player : Player, clicksAmt : number) : Promise<GlobalClickData | undefined> {
		if (!Game.IsServer()) return;

		const playerClickDataKey = `Clicks-Player:${player.userId}`;

		// Get Global clicks from datastore
		const clicksGlobal = await Platform.Server.DataStore.GetKey<GlobalClickData>(
			ScoreKeeper.GLOBAL_CLICK_DATA_KEY,
		);
		let globalCurrentClicks = 0;
		if (clicksGlobal) globalCurrentClicks = clicksGlobal.clicks;

		// Get Player clicks
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
		return globalClickData;
	}

	/* This is where clicks can be visually updates when pulling from the Server
	* Since we retrieve data every 5 seconds, we can simulate the clicks on the button
	* from other players over 5 seconds.
	*/
	private UpdateClicksVisuals() : void {
		// TODO add cool visuals. For now, just update the text
		
	}
}

export class GlobalClickData {
	clicks: number;
}

export class PlayerClickData {
	clicks: number;
}
