import gc from "@sg/game-client-base";
import inversify from "inversify";

const { injectable, inject } = inversify;

@injectable()
export class OverrideDisableGameHandlers extends gc.DisabledGame.DisableGameHandlers {
    inGameHandle() {
        setTimeout(() => {
            this.showPopupHandle();
        }, 0);
    }
}
