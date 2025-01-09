import gc from "@sg/game-client-base";
import { _decorator, EventTouch, Input, input, Intersection2D, KeyCode, Label, math, Node, PolygonCollider2D, sp } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { AutoPlayHandler } from "../../auto-play/auto-play-handler";
import { AutoPlayStore } from "../../auto-play/auto-play-store";
import { BetHandler } from "../bet-handler";
import { HoldActionStore } from "../hold-action-store";

const { Connection } = gc;
const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

@ccclass
export default class PlaceBetButton extends ObserverComponent {
    @property(Node)
    nodeAutoPlay: Node = null;

    @property(Label)
    lblRoundsAutoPlay: Label = null;

    @property(sp.Skeleton)
    effect: sp.Skeleton = null;

    @property(Node)
    tapArea: Node = null;

    private isAutoplay = false;
    private readonly tapButtonSound = "tap_button";

    onLoad() {
        this.resetEffect();
        super.onLoad();
        this.addEvent();
    }

    onDestroy(): void {
        super.onDestroy();
        this.removeEvent();
    }

    resetEffect() {
        this.effect && this.effect.setAnimation(0, "idle", true);
    }

    @handle(BetHandler, (handler) => handler.handle())
    onBet() {
        this.playSound(this.tapButtonSound);
        console.log("onBet ------------------------------ ");
        this.unschedule(this.resetEffect);
        this.effect.setAnimation(0, "tap-anim", false);
        this.scheduleOnce(this.resetEffect, 1);
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playSound(id: string) {
        return id;
    }

    @render(AutoPlayStore, (store) => store.isAutoplay)
    setVisibilityRoundsAutoplay(isAutoPlay: boolean) {
        this.nodeAutoPlay && (this.nodeAutoPlay.active = isAutoPlay);
        this.isAutoplay = isAutoPlay;
    }

    @render(AutoPlayStore, (store) => store.roundsAutoplay)
    setNoOfRound(roundsAutoPlay: number) {
        this.nodeAutoPlay && (this.lblRoundsAutoPlay.string = roundsAutoPlay.toString());
    }

    onClickBetButton() {
        if (!this.isAutoplay) {
            this.onBet();
            return;
        }

        this.cancelAutoPlay();
    }

    @handle(AutoPlayHandler, (handle) => handle.cancelAutoPlay())
    cancelAutoPlay() {}

    protected touchInPolygon(event: EventTouch) {
        const location = event.getUILocation();
        const polygon = this.tapArea.getComponent(PolygonCollider2D).worldPoints;
        return Intersection2D.pointInPolygon(math.v2(location.x, location.y), polygon);
    }

    addEvent() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        this.tapArea.on(Node.EventType.TOUCH_START, this.onTap, this);
        this.tapArea.on(Node.EventType.MOUSE_ENTER, this.eventOnEnter, this);
        this.tapArea.on(Node.EventType.MOUSE_MOVE, this.eventOnEnter, this);
        this.tapArea.on(Node.EventType.MOUSE_LEAVE, this.resetCursor, this);
    }

    removeEvent() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        this.tapArea.off(Node.EventType.TOUCH_START, this.onTap, this);
        this.tapArea.off(Node.EventType.MOUSE_ENTER, this.eventOnEnter, this);
        this.tapArea.off(Node.EventType.MOUSE_MOVE, this.eventOnEnter, this);
        this.tapArea.off(Node.EventType.MOUSE_LEAVE, this.resetCursor, this);
    }

    onKeyDown(event) {
        const { keyCode } = event;
        if (keyCode === KeyCode.SPACE) {
            this.updatePressingKey(true);
        }
    }

    onTap(event) {
        if (this.touchInPolygon(event)) {
            this.onClickBetButton();
        }
    }

    eventOnEnter(event) {
        if (this.touchInPolygon(event)) {
            !this.isAutoplay && (document.body.style.cursor = "pointer");
        } else {
            this.resetCursor();
        }
    }

    resetCursor() {
        document.body.style.cursor = "default";
    }

    onKeyUp(event) {
        const { keyCode } = event;
        if (keyCode === KeyCode.SPACE) {
            this.updatePressingKey(false);
        }
    }

    @handle(BetHandler, (handler, isPressingKey: boolean) => handler.updatePressingKey(isPressingKey))
    updatePressingKey(isPressingKey: boolean) {
        return isPressingKey;
    }

    @render(HoldActionStore, (store) => store.isPressingKey, { fireImmediately: false })
    handlePressingKey(isPressingKey: boolean) {
        if (!isPressingKey) {
            return;
        }

        !this.isAutoplay && this.onBet();
    }
}
