import gc from "@sg/game-client-base";
import inversify from "inversify";
import mobx from "mobx";
import Observer from "observer";
const { handle } = Observer;
const { injectable, inject } = inversify;

@injectable()
export class BalanceInfoHandler implements gc.Shared.IHandler<number> {
    balance = 0;
    private cachedBalance = 0;

    private syncBalance = false;

    @inject(gc.Player.MainPlayerStore) protected readonly mainPlayerStore: gc.Player.MainPlayerStore;

    constructor() {
        mobx.makeAutoObservable(this);
        setTimeout(() => {
            mobx.reaction(
                () => this.mainPlayerStore.balance,
                (balance) => {
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
        this.balance -= balance;
    }

    updateBalance() {
        this.syncBalance = true;
        setTimeout(() => {
            this.checkSyncBalance();
        }, 100);
    }

    checkSyncBalance() {
        if (this.syncBalance) {
            this.balance = this.cachedBalance;
            this.syncBalance = false;
        }
    }
}
