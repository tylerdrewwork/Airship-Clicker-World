export default class ClickVisuals extends AirshipBehaviour {
	public localClicksText : TextMeshProUGUI;
	public globalClicksText : TextMeshProUGUI;
	
	override Start(): void {
		print("Hello, World! from ClickVisuals!");
	}

	public UpdateGlobalClicks(clicks : number) {
		this.globalClicksText.text = tostring(clicks);
	}

	public UpdateLocalClick(clicks : number) {
		this.localClicksText.text = tostring(clicks);
	}
}
