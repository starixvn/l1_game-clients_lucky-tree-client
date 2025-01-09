import gc from "@sg/game-client-base";
import { _decorator, instantiate, Node, Prefab, Toggle } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { AutoPlayHandler } from "../auto-play-handler";
import { AutoPlayStore } from "../auto-play-store";
import AutoPlayRoundNumber from "./auto-play-round-number";

const { Connection } = gc;
const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

@ccclass
export default class AutoPlayPopup extends ObserverComponent {
    @property(Node)
    nodeContent: Node = null;

    @property(Prefab)
    prfNoOfRound: Prefab = null;

    @property(Toggle)
    tglTurboMode: Toggle = null;

    @render(AutoPlayStore, (store) => store.roundsList)
    initContentRounds(roundsList: number[]) {
        this.nodeContent.destroyAllChildren();
        roundsList.forEach((round) => {
            const node = instantiate(this.prfNoOfRound);
            const roundNumber = node.getComponent(AutoPlayRoundNumber);
            roundNumber?.setValue(round);
            this.nodeContent.addChild(node);
        });
    }

    @render(AutoPlayStore, (store) => store.selectedRoundOnPopup)
    renderSelectedRounds(noOfRounds: number) {
        this.nodeContent.children.forEach((child) => {
            const roundNumber = child.getComponent(AutoPlayRoundNumber);
            const selectedBg = roundNumber.value === noOfRounds;
            roundNumber.setSelectedRound(selectedBg);
        });
    }

    @handle(AutoPlayHandler, (handle) => handle.closeAutoPlayPopup())
    onClickclosePopup() {
        this.playSoundClick();
    }

    @handle(AutoPlayHandler, (handle) => handle.confirmRoundAndStart())
    onClickStartButton() {
        this.playSoundClick();
    }

    @handle(AutoPlayHandler, (handle, isTurboMode: boolean) => handle.handleTurboMode(isTurboMode))
    onTurboModeChanged() {
        return this.tglTurboMode.isChecked;
    }

    @render(AutoPlayStore, (store) => store.isTurboMode)
    renderTurboMode(isTurboMode: boolean) {
        this.playSoundClick();
        this.tglTurboMode.isChecked = isTurboMode;
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playSoundClick() {
        return gc.Audios.AudioIds.CLICK;
    }
}
