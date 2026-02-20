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
		const clicksGlobal : ClickData | undefined = await Platform.Server.DataStore.GetKey<ClickData>(`Clicks-Global`);
		
		const clickData : ClickData = {
			clicks: clicks,
			globalClicks: clicksGlobal?.globalClicks ?? 0 + clicks
		}

		await Platform.Server.DataStore.SetKey(`Clicks-Global`, clickData);
		await Platform.Server.DataStore.SetKey(`Clicks-${Game.localPlayer.userId}`, clickData);
	}
}

export class ClickData {
	clicks: number;
	globalClicks: number;
}