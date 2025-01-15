import gc from "@sg/game-client-base";
import inversify from "inversify";
import mobx from "mobx";
import { InstantWinConfigStore } from "../../game-configs/instant-win-config-store";
import { AutoPlayStore } from "../auto-play/auto-play-store";

const { injectable, inject } = inversify;

@injectable()
export class BetAmountStore {
    @inject(AutoPlayStore) protected readonly autoPlayStore: AutoPlayStore;
    @inject(gc.Bet.BetStore) private readonly betStore: gc.Bet.BetStore;
    @inject(InstantWinConfigStore) private readonly gameConfig: InstantWinConfigStore;
    constructor() {
        mobx.makeAutoObservable(this);
    }

    isOpenBetAmountPopup = false;

    get betLevels() {
        return this.gameConfig.betLevels;
    }

    get isMinBetLevelValue() {
        const index = this.betLevels.findIndex((amount) => amount === this.betStore.amount);
        if (index <= 0) {
            return true;
        }
        return false;
    }

    get isMaxbetLevelValue() {
        const index = this.betLevels.findIndex((amount) => amount === this.betStore.amount);
        if (index >= this.betLevels.length - 1) {
            return true;
        }
        return false;
    }
}
