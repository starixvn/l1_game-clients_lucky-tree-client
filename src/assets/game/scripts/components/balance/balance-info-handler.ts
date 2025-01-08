import gc from "@sg/game-client-base";
import inversify from "inversify";
import Observer from "observer";
const { observer, render, handle } = Observer;
const { injectable, inject } = inversify;

@injectable()
export class BalanceInfoHandler implements gc.Shared.IHandler<number> {
    @inject(gc.Player.MainPlayerStore) protected readonly mainPlayerStore: gc.Player.MainPlayerStore;
    handle() {}
    increaseBalance(balance: number) {
        this.updateBalance();
    }

    descreaseBalance(balance: number) {
        this.mainPlayerStore.balance -= balance;
    }

    @handle(gc.Auth.AuthHandlers.GetBalance)
    updateBalance() {}
}
