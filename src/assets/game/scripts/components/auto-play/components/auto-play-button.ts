import gc from "@sg/game-client-base";
import { _decorator, Node, Sprite } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { AutoPlayHandler } from "../auto-play-handler";
import { AutoPlayStore } from "../auto-play-store";

const { Connection } = gc;
const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

@ccclass
export default class AutoPlayButton extends ObserverComponent {
    @property(Sprite)
    sprIconAutoPlay: Sprite = null;

    @property(Sprite)
    sprIconPause: Sprite = null;

    @property(Node)
    nodeOverlay: Node = null;

    @handle(AutoPlayHandler, (handle) => handle.clickAutoPlay())
    onClickAutoPlay() {
        this.playSoundClick();
    }

    @render(AutoPlayStore, (store) => store.isTurnOnAutoPlay)
    updateAutoPlayButton(isTurnOnAutoPlay: boolean) {
        this.sprIconAutoPlay.node.active = !isTurnOnAutoPlay;
        this.sprIconPause.node.active = isTurnOnAutoPlay;
        this.nodeOverlay && (this.nodeOverlay.active = isTurnOnAutoPlay);
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playSoundClick() {
        return gc.Audios.AudioIds.CLICK;
    }
}
