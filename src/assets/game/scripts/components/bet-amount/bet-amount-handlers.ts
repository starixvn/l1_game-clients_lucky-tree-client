import gc from "@sg/game-client-base";
import inversify from "inversify";
import { BetAmountStore } from "./bet-amount-store";

const { injectable, inject } = inversify;

@injectable()
export class BetAmountHandlers implements gc.Shared.IHandler<gc.GameServiceMessage.GameConfigs> {
    @inject(BetAmountStore) protected readonly betAmountStore: BetAmountStore;
    @inject(gc.Bet.BetStore) private readonly betStore: gc.Bet.BetStore;

    handle() {}

    updateBetAmount(betAmount: number) {
        this.betStore.amount = betAmount;
        this.updateStatusBetAmountPopup(false);
    }

    updateStatusBetAmountPopup(isOpen: boolean) {
        this.betAmountStore.isOpenBetAmountPopup = isOpen;
    }
}
