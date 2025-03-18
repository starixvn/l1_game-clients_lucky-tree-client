import gc from "@sg/game-client-base";
import { _decorator, Node } from "cc";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";

import GameComponent from "db://shared-components/game/scripts/components/game-component";
import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions, settings } from "../game-settings";
import "./../../../resources/i18n";
import { AutoPlayHandler } from "./auto-play/auto-play-handler";
import { BalanceInfoHandler } from "./balance/balance-info-handler";
import { EffectContainer } from "./win/effect-container";

startGame(settings.name, containerOptions, siteConfigs, settings.namespaces);

const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

export interface IWinInstantResult {
    betWin: number;
    bigWin: true;
}

@ccclass
@observer(settings.name)
export default class Game extends GameComponent {
    @property(Node)
    nodeEffectContainer: Node = null;

    override namespace = settings.name;
    override containerOptions = containerOptions;
    protected override enableEventShowHideGame = false;
    _effectContainer: EffectContainer = null;

    get effectContainer() {
        if (!this._effectContainer) {
            this._effectContainer = this.nodeEffectContainer.getComponentInChildren(EffectContainer);
        }
        return this._effectContainer;
    }

    async showResult(result: IWinInstantResult, hasAnimation: boolean, settlementResult: gc.GameServiceMessage.TSettlementResult) {
        if (!result) {
            return;
        }
        if (result.betWin > 0) {
            this.decreaseReceivedBet();
            this.effectContainer?.showMainPlayerWinning(result);
        } else {
            this.updateBalance();
        }
        this.checkSpinNextRound();
    }

    @handle(BalanceInfoHandler, (handle) => handle.decreaseReceivedBet())
    decreaseReceivedBet() {}

    @handle(BalanceInfoHandler, (handle) => handle.updateBalance())
    private updateBalance() {}

    isValidResult(result: gc.GameServiceMessage.TResult, settlementResult: gc.GameServiceMessage.TSettlementResult) {
        return !!result;
    }

    @handle(AutoPlayHandler, (handle) => handle.checkSpinNextRound())
    checkSpinNextRound() {}

    renderRoundId(roundId: number) {
        //override parent component
    }

    @render(gc.Settlements.SettlementStore, (store) => store.currentFinish, {
        fireImmediately: false,
    })
    showRoundId(currentFinish: any) {
        this.lblRoundId && (this.lblRoundId.string = `#${currentFinish.roundId}`);
    }
}
