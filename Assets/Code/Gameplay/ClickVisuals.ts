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

	private numberWithCommas(x: number): string {
		if (x === 0) return "0";
		let result = "";
		let n = math.abs(x);
		while (n > 0) {
			const chunk = n % 1000;
			n = math.floor(n / 1000);
			const chunkStr = chunk.ToString();
			const pad = n > 0 && chunk < 100 ? (chunk < 10 ? "00" : "0") : "";
			result = (n > 0 ? "," : "") + pad + chunkStr + result;
		}
		return x < 0 ? "-" + result : result;
	}
}
