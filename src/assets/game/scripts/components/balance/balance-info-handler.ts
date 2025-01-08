import gc from "@sg/game-client-base";
import inversify from "inversify";
import mobx from "mobx";
import Observer from "observer";
const { observer, render, handle } = Observer;
const { injectable, inject } = inversify;

@injectable()
export class BalanceInfoHandler implements gc.Shared.IHandler<number> {
    balance = 0;
    private cachedBalance = 0;

    @inject(gc.Player.MainPlayerStore) protected readonly mainPlayerStore: gc.Player.MainPlayerStore;

    constructor() {
        mobx.makeAutoObservable(this);
        setTimeout(() => {
            mobx.reaction(
                () => this.mainPlayerStore.balance,
                (balance) => {
                    console.log("cached balance --------------", balance);
                    this.cachedBalance = balance;
                }
            );

            this.cachedBalance = this.mainPlayerStore.balance;
            this.balance = this.cachedBalance;
        }, 0);
    }

    handle() {}

    increaseBalance(balance: number) {
        this.updateBalance();
    }

    descreaseBalance(balance: number) {
        console.log(` decrease balance before ${balance}`, this.balance);
        this.balance -= balance;
        console.log(` decrease balance after`, this.balance);
    }

    // @handle(gc.Auth.AuthHandlers.GetBalance)
    updateBalance() {
        this.balance = this.cachedBalance;
        console.log("update balance =====================");
    }
}
