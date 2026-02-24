import { Game } from "@Easy/Core/Shared/Game";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import GameRules from "Code/GameRules";
import { NetworkFunction } from "@Easy/Core/Shared/Network/NetworkFunction";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import { Airship } from '../../AirshipPackages/@Easy/Core/Shared/Airship';

export default class CustomCharacterController extends AirshipBehaviour {

	public cursorRect: RectTransform;
	private isOwner: boolean;
	public cursorColor: Color;


	protected Start(): void {
		
		
		if (Game.IsClient()) {
			// assign random color
			// let randomColorIndex = math.random(0, GameRules.Get().possibleColors.size() - 1);
			// this.cursorColor = GameRules.Get().possibleColors[randomColorIndex];

			// register to other characters syncing
			GameRules.Get().syncCustomCharacterColors.client.OnServerEvent(event => {
				let syncedPlayer = Airship.Players.FindByUserId(event.userId);
				let customChar = syncedPlayer?.character?.gameObject.GetAirshipComponent<CustomCharacterController>();
				if (customChar) {
					// customChar.UpdateColorAndName(event.color, event.username);
					print("event color & user" + event.color + event.username)
					let usernameTmp = customChar.gameObject.GetComponentInChildren<TextMeshProUGUI>();
					let image = customChar.gameObject.GetComponentInChildren<Image>();
					print("sr and tmp" + image + usernameTmp)

					if (image) image.color = event.color;
					if (usernameTmp) usernameTmp.text = event.username
				}
			})
		}
		
		

		if (Game.IsClient()) this.C_Initialize();
	}

	override Update(): void {
		if (Game.IsClient() && this.isOwner) this.FollowCursor();
	}

	@Client()
	private C_Initialize() {
		let onCustomCharacterInitialized = GameRules.Get().onCustomCharacterInstantiated;

		

		// Check if we are owner of this character
		if (Game.localPlayer.character?.gameObject.GetAirshipComponent<CustomCharacterController>() === this) {
			this.isOwner = true;
			print("is owner?" + this.isOwner)

			// make our mouse topmost
			let sr = this.gameObject.GetComponentInChildren<SpriteRenderer>();
			if (sr) {
				sr.sortingOrder = 10;
				// sr.color = this.cursorColor;
			}

			this.UpdateColorAndName(this.cursorColor, Game.localPlayer.username)
			// add our username
			let usernameText = this.gameObject.GetComponentInChildren<TextMeshProUGUI>();
			if (usernameText) {
				usernameText.text = Game.localPlayer.username;
				// usernameText.color = this.cursorColor;
			}

			
			Mouse.SetCursorVisible(false);
			
			onCustomCharacterInitialized.client.FireServer({});
		}
		else this.isOwner = false;
	}

	public UpdateColorAndName(color: Color, name: string) {
		
	}

	private FollowCursor() {
		// print("following")
		//Point the character towards the mouse
		let newPos = Mouse.GetPositionVector3();
		// let newPos = GameRules.Get().mainCamera.ScreenToWorldPoint(mousepos);

		//Move our custom cursor graphic
		this.cursorRect.position = new Vector3(
			newPos.x,
			newPos.y,
			0
		);
	}
}
