import gc from "@sg/game-client-base";
import { _decorator, Label, tween, Vec3 } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { BalanceInfoHandler } from "./balance-info-handler";
const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;
const { Player, Bet, FormatUtils, Settlements } = gc;
const { MainPlayerStore } = Player;

@ccclass
export class BalanceInfo extends ObserverComponent {
    @property(Label)
    lblBalance: Label = null;

    @render(BalanceInfoHandler, (store) => store.balance)
    setBalance(value: number) {
        this.lblBalance && (this.lblBalance.string = FormatUtils.truncateFixedDecimals(value, 2).toString());
        tween(this.lblBalance.node)
            .to(0.1, { scale: new Vec3(0.55, 0.55, 1) })
            .to(0.1, { scale: new Vec3(0.5, 0.5, 1) })
            .start();
    }
}
