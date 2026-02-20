import { Platform } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";

export default class ScoreKeeper extends AirshipBehaviour {

	private clicksInBatch = 0;

	override Start(): void {
		print("Hello, World! from ScoreKeeper!");


	}

	public AddScore(clicks: number): void {
		// TODO add a delay to sending to the batch to avoid spamming data store
		this.AddScoreToDataStoreInBatch(clicks);
	}

	public async AddScoreToDataStoreInBatch(clicks: number): Promise<void> {
		const clicksGlobal : GlobalClickData | undefined = await Platform.Server.DataStore.GetKey<GlobalClickData>(`Clicks-Global`);
		
		const globalClickData : GlobalClickData = {
			clicks: clicksGlobal?.clicks ?? 0 + clicks
		}

		const playerClickData : PlayerClickData = {
			clicks: clicks,
		}

		await Platform.Server.DataStore.SetKey(`Clicks-Global`, globalClickData);
		await Platform.Server.DataStore.SetKey(`Clicks-Player:${Game.localPlayer.userId}`, playerClickData);
	}
}

export class GlobalClickData {
	clicks: number;
}

export class PlayerClickData {
	clicks: number;
}
