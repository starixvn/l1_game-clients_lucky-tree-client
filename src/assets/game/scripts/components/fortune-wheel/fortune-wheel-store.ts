import inversify from "inversify";
import mobx from "mobx";

const { injectable, inject } = inversify;

export enum WheelEvent {
    SHOW_WHEEL = "showWheel",
    HIDE_WHEEL = "hideWheel",
    SHOW_REWARD = "showReward",
    HIDE_REWARD = "hideReward",
}

@injectable()
export class FortuneWheelStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }

    enabled = false;
    bonusPot = 0;
    tapCount = 0;
    tapCountMax = 1000;
    wheelConfigs: number[] = [];
    wheelResult = {};
    event = {};
}
