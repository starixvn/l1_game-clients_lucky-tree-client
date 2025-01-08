import gc from "@sg/game-client-base";
import { _decorator, instantiate, Label, Node, Prefab, tween, Vec3 } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";

import { InstantWinConfigStore } from "../../../game-configs/instant-win-config-store";
import { AutoPlayStore } from "../../auto-play/auto-play-store";
import { BetAmountHandlers } from "../bet-amount-handlers";
import { BetAmountStore } from "../bet-amount-store";
import BetLevelsContainer from "./bet-levels-container";

const { FormatUtils } = gc;
const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

@ccclass
export default class BetAmount extends ObserverComponent {
    @property(Node)
    nodeBetLevelsContainer: Node = null;

    @property(Prefab)
    prfBetLevelsContainer: Prefab = null;

    @property(Label)
    lblBetLevelDefault: Label = null;

    @property(Node)
    nodeDisabledDescrease: Node = null;

    @property(Node)
    nodeDisabledInscrease: Node = null;

    @property(Node)
    nodeOverlayBg: Node = null;

    @property(Node)
    nodeDisabledBetAmount: Node = null;

    private betLevelsContainer: BetLevelsContainer = null;
    private betAmount = 0;
    private betLevels = [];

    onLoad() {
        super.onLoad();
        this.nodeOverlayBg.active = false;
    }

    @render(InstantWinConfigStore, (store) => store.defaultBetLevel)
    showDefaultBetLevel(defaultBetLevel: number) {
        this.updateBetAmount(defaultBetLevel);
    }

    @handle(BetAmountHandlers, (handle, amount: number) => handle.updateBetAmount(amount))
    updateBetAmount(amount: number) {
        return amount;
    }

    @render(gc.Bet.BetStore, (store) => store.amount)
    renderBetAmount(betAmount: number) {
        this.setBetAmount(betAmount);
    }

    setBetAmount(betAmount: number) {
        this.lblBetLevelDefault.string = FormatUtils.numberWithCommas(betAmount, 2);
        this.betAmount = betAmount;
    }

    @render(BetAmountStore, (store) => store.betLevels)
    assignBetLevel(betLevels: number[]) {
        this.betLevels = betLevels;
        this.nodeBetLevelsContainer.destroyAllChildren();
        const container = instantiate(this.prfBetLevelsContainer);
        this.betLevelsContainer = container.getComponent(BetLevelsContainer);
        this.betLevelsContainer.setBetLevels(betLevels);
        this.nodeBetLevelsContainer.addChild(container);
    }

    hideBetLevelsContainer() {
        if (!this.nodeBetLevelsContainer) {
            return;
        }
        this.nodeOverlayBg.active = false;
        tween(this.nodeBetLevelsContainer)
            .to(0.2, { scale: new Vec3(1, 0, 1) })
            .call(() => {
                this.nodeBetLevelsContainer.active = false;
            })
            .start();
    }

    showBetLevelsContainer() {
        if (!this.nodeBetLevelsContainer) {
            return;
        }
        this.nodeOverlayBg.active = true;
        this.nodeBetLevelsContainer.active = true;
        this.nodeBetLevelsContainer.setScale(new Vec3(1, 0, 1));
        tween(this.nodeBetLevelsContainer)
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    onBetLevelButtonClick() {
        const isShowing = this.isShowStakeLevels();
        if (!isShowing) {
            this.showBetLevelsContainer();
            this.openBetAmountPopup(true);
        } else {
            this.hideBetLevelsContainer();
            this.openBetAmountPopup(false);
        }
    }

    @handle(BetAmountHandlers, (handle, isOpen: boolean) => handle.updateStatusBetAmountPopup(isOpen))
    openBetAmountPopup(isOpen: boolean) {
        return isOpen;
    }

    isShowStakeLevels(): boolean {
        return this.nodeBetLevelsContainer && this.nodeBetLevelsContainer.active && this.nodeBetLevelsContainer.scale.y === 1;
    }

    @handle(BetAmountHandlers, (handle, amount: number) => handle.updateBetAmount(amount))
    onClickDescreaseButton() {
        let index = this.findIndexBetLevel() - 1;
        return this.betLevels[index];
    }

    @handle(BetAmountHandlers, (handle, amount: number) => handle.updateBetAmount(amount))
    onClickInscreaseButton() {
        let index = this.findIndexBetLevel() + 1;
        return this.betLevels[index];
    }

    findIndexBetLevel(): number {
        return this.betLevels.findIndex((amount) => amount === this.betAmount);
    }

    onClickOverlayBg() {
        this.hideBetLevelsContainer();
    }

    @render(BetAmountStore, (store) => store.isOpenBetAmountPopup)
    setVisibilityBetAmountPopup(isOpenBetAmountPopup: boolean) {
        isOpenBetAmountPopup ? this.showBetLevelsContainer() : this.hideBetLevelsContainer();
    }

    @render(AutoPlayStore, (store) => store.isTurnOnAutoPlay)
    disabledBetAmount(isTurnOnAutoPlay: boolean) {
        this.nodeDisabledBetAmount.active = isTurnOnAutoPlay;
    }

    @render(BetAmountStore, (store) => store.isMaxbetLevelValue)
    disabledMaxBetLevel(isMaxbetLevelValue: boolean) {
        this.nodeDisabledInscrease.active = isMaxbetLevelValue;
    }

    @render(BetAmountStore, (store) => store.isMinBetLevelValue)
    disabledMinBetLevel(isMinBetLevelValue: boolean) {
        this.nodeDisabledDescrease.active = isMinBetLevelValue;
    }
}
