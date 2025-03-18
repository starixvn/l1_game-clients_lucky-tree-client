import gc from "@sg/game-client-base";
import { _decorator, Component, Label, Sprite, SpriteFrame, tween, UIOpacity, v3 } from "cc";
import { bundleManager } from "db://shared-components/shared/common-components/bundle-manager/bundle-manager";

const { FormatUtils } = gc;
const { ccclass, property } = _decorator;

@ccclass
export default class BetWinNotice extends Component {
    @property(Sprite)
    avatar: Sprite = null;

    @property(Label)
    lblBetWin: Label = null;

    @property(Label)
    lblName: Label = null;

    setName(name: string) {
        if (this.lblName) {
            this.lblName.string = name;
        }
    }

    async setAvatar(avatarId: number) {
        if (!this.avatar) {
            return true;
        }
        try {
            const spriteFrame = await bundleManager.loadSharedAsset<SpriteFrame>(`images/avatars/${avatarId}/spriteFrame`, SpriteFrame);
            if (spriteFrame) {
                this.avatar.spriteFrame = spriteFrame;
                this.avatar.node.active = true;
                return true;
            }
        } catch (error) {}
        return false;
    }

    flyUp(betWin: number, fadeOut: boolean, onFinish: () => void) {
        this.setBetWin(betWin);

        const uiOpacity = this.node.getComponent(UIOpacity);
        uiOpacity.opacity = 255;
        const duration = 1.5;

        if (fadeOut) {
            tween(uiOpacity)
                .delay(0.5 * duration)
                .to(0.5 * duration, { opacity: 50 }, { easing: "sineOut" })
                .start();
        }

        tween(this.node)
            .parallel(
                tween(this.node)
                    .to(
                        duration / 2,
                        {
                            scale: v3(1.1, 1.1, 0),
                        },
                        { easing: "sineOut" }
                    )
                    .to(
                        duration / 2,
                        {
                            scale: v3(0.5, 0.5, 0),
                        },
                        { easing: "sineInOut" }
                    ),
                tween(this.node).by(
                    duration,
                    {
                        position: v3(0, 150, 0),
                    },
                    { easing: "sineOut" }
                )
            )

            .call(onFinish)
            .start();
    }

    setBetWin(betWin: number) {
        this.lblBetWin.string = `+${FormatUtils.numberWithCommas(betWin, 2)}`;
    }
}
