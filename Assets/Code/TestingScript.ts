import { Airship } from "@Easy/Core/Shared/Airship";
import CharacterConfigSetup from "@Easy/Core/Shared/Character/CharacterConfigSetup";
import { CharacterCameraMode } from "@Easy/Core/Shared/Character/LocalCharacter/CharacterCameraMode";
import { MoveDirectionMode } from "@Easy/Core/Shared/Character/LocalCharacter/MoveDirectionMode";
import { Game } from "@Easy/Core/Shared/Game";

// Used for testing various parts of the Airship documentation
export default class CustomCharacterConfig extends CharacterConfigSetup {
	public OnEnable() {
        //Character
        //Set the default prefab to use whenever a character is spawned
        Airship.Characters.SetDefaultCharacterPrefab(this.customCharacterPrefab);

        //Local Character Configs
        if (Game.IsClient()) {
            //Movement
            //Control how client inputs are recieved by the movement system
            Airship.Characters.localCharacterManager.SetMoveDirMode(MoveDirectionMode.World);

            //Camera
            //Toggle the core camera system
            Airship.Camera.SetEnabled(this.useAirshipCameraSystem);
            if (this.useAirshipCameraSystem) {
                //Allow clients to toggle their view model
                Airship.Camera.canToggleFirstPerson = this.allowFirstPersonToggle;
                if (this.startInFirstPerson) {
                    //Change to a new camera mode
                    Airship.Camera.SetMode(CharacterCameraMode.Fixed);
                    //Force first person view model
                    Airship.Camera.SetFirstPerson(this.startInFirstPerson);
                }
            }

            // UI visual toggles
            Airship.Chat.SetUIEnabled(this.showChat);
            Airship.Inventory.SetUIVisibility(this.inventoryVisibility);
        }

        //Stop any input for some movement options we don't use
        if (!this.enableJumping || !this.enableCrouching || !this.enableSprinting) {
            //Listen to input event
            Airship.Characters.localCharacterManager.onBeforeLocalEntityInput.Connect((event) => {
                //Force the event off if we don't want that feature
                if (!this.enableJumping) {
                    event.jump = false;
                }
                if (!this.enableCrouching) {
                    event.crouch = false;
                }
                if (!this.enableSprinting) {
                    event.sprinting = false;
                }
            });
        }
    }
}
