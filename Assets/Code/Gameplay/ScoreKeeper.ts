import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { NetworkFunction } from "@Easy/Core/Shared/Network/NetworkFunction";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import { Player } from "@Easy/Core/Shared/Player/Player";
import GameRules from "Code/GameRules";

// TODO instead of each player make DataStore requests, there should be a NetworkIdentity object
// that tracks clicks for each player on the server and then makes ONE datastore request
export default class ScoreKeeper extends AirshipBehaviour {

	private static readonly GLOBAL_CLICK_DATA_KEY = `Clicks-Global`;
	private clicksInBatch = 0;
	private cachedPlayerClicks = 0;
	private cachedGlobalClicks = 0;
	private lastBatchTime = 0;
	/// Every `BATCH_INTERVAL` seconds the score will update from the datastore
	private static readonly BATCH_INTERVAL = 5; // In Seconds


	// Tyler's note for learning NetworkFunction's generics:
	// first generic argument is the object that the client fires to the server
	// second generic argument is the object that is returned via callback
	// That being said, this was converted back to NetworkSignal, which has no specified return type
	private addClicksToServer = new NetworkSignal<{ clicks: number }>("AddClicks");
	private syncGlobalClicksToClient = new NetworkSignal<{ clicks: number }>("SyncGlobalClicksToClient");

	private initSyncClicks = new NetworkSignal<{ playerClicks: number, globalClicks: number}>("GetClicks");

	override Start(): void {
		print("Hello, World! from ScoreKeeper!");

		if (Game.IsServer()) {
			// Connect addClicks NetworkFunction callback
			this.addClicksToServer.server.OnClientEvent((player, event) => {
				// Once request resolves, send globalclicks data back to player
				this.S_AddScoreToDataStoreInBatch(player, event.clicks).then(res => {
					let clicksResult = 0;
					if (res) clicksResult = res.clicks;
					this.syncGlobalClicksToClient.server.FireClient(player, { clicks: clicksResult });
				});
			})

			// On Player Joined
			Airship.Players.onPlayerJoined.Connect(player => this.S_OnPlayerJoined(player));
		}

		if (Game.IsClient()) {
			// Initialize the click amounts
			this.initSyncClicks.client.OnServerEvent((data) => {
				this.cachedPlayerClicks = data.playerClicks;
				this.cachedGlobalClicks = data.globalClicks;
				GameRules.Get().clickVisuals.UpdateLocalClick(data.playerClicks);
				GameRules.Get().clickVisuals.UpdateGlobalClicks(data.globalClicks); // update directly instead of method to bypass animation
			});

			// Subscribe to the server sending globalclick data back to the client
			this.syncGlobalClicksToClient.client.OnServerEvent((data) => {
				this.UpdateGlobalClicksVisuals(data.clicks);
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

	public AddClickLocal(): void {
		this.clicksInBatch++;
		this.cachedPlayerClicks++;
		this.cachedGlobalClicks++;

		let cv = GameRules.Get().clickVisuals;
		cv.UpdateLocalClick(this.cachedPlayerClicks);
		cv.UpdateGlobalClicks(this.cachedGlobalClicks);
	}

	public C_RequestAddClicks(): void {
		if (!Game.IsClient()) return;

		// Client -> Server
		// Network Signal 
		// GameRules.Get().clickVisuals.UpdateGlobalClicks(newGlobalClicks.clicks); // no longer needed due to addclicks change to NetworkSignal
		this.addClicksToServer.client.FireServer({ clicks: this.clicksInBatch });
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

	@Server() 
	private async S_OnPlayerJoined(player: Player) {
		// Sync player's clicks to clientside
		const playerClickData = await Platform.Server.DataStore.GetKey<PlayerClickData>(`Clicks-Player:${player.userId}`);
		let playerClicks = 0;
		if (playerClickData) playerClicks = playerClickData.clicks;

		const globalClickData = await Platform.Server.DataStore.GetKey<GlobalClickData>(
			ScoreKeeper.GLOBAL_CLICK_DATA_KEY,
		);
		let globalClicks = 0;
		if (globalClickData) globalClicks = globalClickData.clicks;

		this.initSyncClicks.server.FireClient(player, {playerClicks, globalClicks})
	}

	/* This is where clicks can be visually updates when pulling from the Server
	* Since we retrieve data every 5 seconds, we can simulate the clicks on the button
	* from other players over 5 seconds.
	*/
	private UpdateGlobalClicksVisuals(clicks : number) : void {
		// TODO add cool visuals. For now, just update the text
		GameRules.Get().clickVisuals.UpdateGlobalClicks(clicks);
		this.cachedGlobalClicks = clicks;
	}
}

export class GlobalClickData {
	clicks: number;
}

export class PlayerClickData {
	clicks: number;
}
