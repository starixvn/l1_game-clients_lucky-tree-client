import gc from "@sg/game-client-base";
import inversify from "inversify";
import { GameServiceMessage } from "../game-message";
import { InstantWinConfigStore } from "./instant-win-config-store";
const { injectable, inject } = inversify;

@injectable()
export class InstantWinConfigHandler implements gc.Shared.IMultipleHandlers {
    @inject(InstantWinConfigStore) protected readonly instantWinConfigStore: InstantWinConfigStore;
    handleGameConfigs(gameConfigs: GameServiceMessage.InstantGameConfigs) {
        this.instantWinConfigStore.defaultBetLevel = gameConfigs.defaultBetLevel;
        this.instantWinConfigStore.betLevels = gameConfigs.betLevels;
    }

    eventHandleList = [
        {
            name: GameServiceMessage.InstantGameConfigs.eventName,
            handle: this.handleGameConfigs,
        },
    ];
}
