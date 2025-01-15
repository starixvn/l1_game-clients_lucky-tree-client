import inversify from "inversify";
import mobx from "mobx";

const { injectable, inject } = inversify;

@injectable()
export class AutoPlayStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }

    public roundsList = [10, 30, 50, 80, 100, 200, 500, 1000];
    public isOpenAutoplayPopup = false;
    public selectedRoundOnPopup = this.roundsList[0];
    public roundsAutoplay = 0;

    public isAutoplay = false;
    public isTurboMode = false;

    public triggerBet = null;

    get isTurnOnAutoPlay() {
        return this.isOpenAutoplayPopup || this.isAutoplay;
    }
}
