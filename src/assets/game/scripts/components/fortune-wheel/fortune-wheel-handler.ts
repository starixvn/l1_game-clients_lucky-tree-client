import gc from "@sg/game-client-base";
import inversify from "inversify";
import mobx from "mobx";
import { AutoPlayStore } from "../auto-play/auto-play-store";
import { BetAmountStore } from "../bet-amount/bet-amount-store";
import { FortuneWheelStore, WheelEvent } from "./fortune-wheel-store";

const { injectable, inject } = inversify;


@injectable()
export class FortuneWheelHandler implements gc.Shared.IMultipleHandlers {
    @inject(AutoPlayStore) protected readonly autoPlayStore: AutoPlayStore;
    @inject(BetAmountStore) protected readonly betAmountStore: BetAmountStore;
    @inject(FortuneWheelStore) protected readonly fortuneWheelStore: FortuneWheelStore;
    constructor() {
        mobx.makeAutoObservable(this);
        setTimeout(() => {

        }, 0);
    }

    eventHandleList = []

    handle() { }

    setConfig(config: { enabled: boolean, tapCountMax: number }) {
        this.fortuneWheelStore.enabled = config.enabled;
        this.fortuneWheelStore.tapCountMax = config.tapCountMax;
    }

    setTapCount(tapCount: number) {
        this.fortuneWheelStore.tapCount = tapCount;
    }

    setBonusPot(bonusPot: number) {
        this.fortuneWheelStore.bonusPot = bonusPot;
    }

    showWheel() {
        this.fortuneWheelStore.event = { event: WheelEvent.SHOW_WHEEL };
    }

    hideWheel() {
        this.fortuneWheelStore.event = { event: WheelEvent.HIDE_WHEEL };
    }

    showReward(win: number) {
        this.fortuneWheelStore.event = { event: WheelEvent.SHOW_REWARD, win };
    }

    spinWheel() {
        //TODO: send request spin wheel
    }

    handleSpinWheel(index: number) {
        this.fortuneWheelStore.wheelResult = { index };
    }
}
