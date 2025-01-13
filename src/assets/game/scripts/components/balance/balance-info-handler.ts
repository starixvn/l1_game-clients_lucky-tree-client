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
    private cachedReceivedBet = 0;
    private syncBalance = false;

    @inject(gc.Player.MainPlayerStore) protected readonly mainPlayerStore: gc.Player.MainPlayerStore;
    @inject(gc.Auth.AuthHandlers.GetBalance) protected readonly balanceHandler: gc.Auth.AuthHandlers.GetBalance;
    @inject(gc.Bet.BetStore) protected readonly betStore: gc.Bet.BetStore;

    constructor() {
        mobx.makeAutoObservable(this);
        setTimeout(() => {
            mobx.reaction(
                () => this.mainPlayerStore.balance,
                (balance) => {
                    console.log("real balance changed", balance);
                    this.cachedBalance = balance;
                }
            );

            mobx.reaction(
                () => this.betStore.lastReceivedBet,
                (lastReceivedBet) => {
                    if (lastReceivedBet && lastReceivedBet.value > 0 && lastReceivedBet.isAnimated) {
                        console.log("lastReceivedBet -------- ", lastReceivedBet.value);
                        this.cachedReceivedBet = lastReceivedBet.value;
                    }
                }
            );

            this.cachedBalance = this.mainPlayerStore.balance;
            this.balance = this.cachedBalance;
        }, 0);
    }

    handle() {}

    decreaseReceivedBet() {
        const newBalance = this.balance - this.cachedReceivedBet;
        this.balance = newBalance < 0 ? 0 : newBalance;
    }

    updateBalance() {
        this.balanceHandler.handle();

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
