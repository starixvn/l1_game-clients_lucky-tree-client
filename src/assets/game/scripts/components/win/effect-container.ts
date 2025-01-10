import gc from "@sg/game-client-base";
import { _decorator, instantiate, math, Node, Prefab, sp, tween, v3 } from "cc";
import { GameVisibilityStore } from "db://shared-components/shared/common-components/game-visibility/game-visibility-store";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import { AnimationUtils, FunctionUtils } from "db://shared-components/shared/utils";
import Observer from "observer";
import { SoundNameList } from "../../sound-name";
import { BalanceInfoHandler } from "../balance/balance-info-handler";
import { IWinner, LeaderBoardStore } from "../leader-board/leader-board-store";
import BetWinNotice from "./bet-win-notice";
const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

enum AnimationNameTree {
    bigWin = "big-win-tree",
    normalWin = "normal-win-tree",
    normalWinCoin = "normal-win-coin",
    bigWinCoin = "big-win-coin",
    idle = "idle",
}

enum AnimationNameLeaf {
    win = "Leaf-fall-win",
    idle = "leaf-fall-idle",
}

interface SlotInfo {
    used: boolean;
    usageCount: number;
    playerId?: string;
    timeoutId?: NodeJS.Timeout;
}

@ccclass("EffectContainer")
export class EffectContainer extends ObserverComponent {
    @property(sp.Skeleton)
    spineTree: sp.Skeleton = null;

    @property(sp.Skeleton)
    spineLeaf: sp.Skeleton = null;

    @property(Prefab)
    prfOtherWinNotice: Prefab = null;

    @property(Prefab)
    prfMainPlayerNotice: Prefab = null;

    @property(Node)
    randomArea: Node = null;

    @property(Node)
    balanceNode: Node = null;

    container: Node = null;

    private forceNewAnimation = false;
    private feafTimeStamp = 0;
    private treeTimeStamp = 0;
    private gameVisible = true;
    private SLOT_TIMEOUT = 5000;
    private slots: { [id: number]: SlotInfo } = {};

    onLoad() {
        this.container = this.node.getChildByName("notice-container");
        this.initUsedSlot();
        this.settingMixDuration();
        this.resetAnimations();

        super.onLoad();
    }

    private settingMixDuration() {
        const mixDuration = 0.3;
        this.spineTree.setMix(AnimationNameTree.idle, AnimationNameTree.normalWin, mixDuration);
        this.spineTree.setMix(AnimationNameTree.idle, AnimationNameTree.bigWin, mixDuration);

        this.spineTree.setMix(AnimationNameTree.normalWin, AnimationNameTree.normalWin, mixDuration);
        this.spineTree.setMix(AnimationNameTree.normalWin, AnimationNameTree.bigWin, mixDuration);

        this.spineTree.setMix(AnimationNameTree.bigWin, AnimationNameTree.normalWin, mixDuration);
        this.spineTree.setMix(AnimationNameTree.bigWin, AnimationNameTree.bigWin, mixDuration);
    }

    @render(GameVisibilityStore, (store) => store.isVisible)
    renderGameVisibility(visible: boolean) {
        this.gameVisible = visible;
    }

    @render(LeaderBoardStore, (store) => store.winner, { fireImmediately: false })
    showWinners(winner: IWinner) {
        const { betWin, bigWin, avatarId, name, id } = winner;

        if (betWin <= 0 || this.checkAvailableSlot() === false) {
            return;
        }
        this.playWinAnimations(bigWin, false);

        const encryptedName = this.encryptedName(name);
        this.showOtherWinnerNotice(id, encryptedName, betWin, avatarId);
    }

    private encryptedName(name: string): string {
        return `${name.substring(0, 1)}***${name.substring(name.length - 3, name.length)}`;
    }

    showMainPlayerWinning(data: { betWin: number; bigWin: boolean }) {
        const { betWin, bigWin } = data;
        this.playWinAnimations(bigWin, true);
        this.showMainPlayerNotice(betWin, bigWin);
    }

    private resetAnimations() {
        this.playAnim(this.spineLeaf, AnimationNameLeaf.idle, true);
        this.playAnim(this.spineTree, AnimationNameTree.idle, true);
    }

    private async playWinAnimations(isBigWin: boolean, isMainPlayer: boolean) {
        if (!this.gameVisible) {
            return;
        }
        const callNewAnimation = this.forceNewAnimation ? false : isMainPlayer;
        if (isMainPlayer) {
            this.forceNewAnimation = true;
        }

        if (!AnimationUtils.isAnimationPlaying(this.spineLeaf, AnimationNameLeaf.win) || callNewAnimation) {
            const stamp = Date.now();
            this.feafTimeStamp = stamp;
            this.playAnim(this.spineLeaf, AnimationNameLeaf.win, false).then(() => {
                if (this.feafTimeStamp === stamp) {
                    this.playAnim(this.spineLeaf, AnimationNameLeaf.idle, true);
                }
            });
        }

        const treeAnimation = isBigWin ? AnimationNameTree.bigWin : AnimationNameTree.normalWin;
        const isTreeAnimPlaying =
            AnimationUtils.isAnimationPlaying(this.spineTree, AnimationNameTree.bigWin) ||
            AnimationUtils.isAnimationPlaying(this.spineTree, AnimationNameTree.normalWin);

        //coin animation
        const isMainPlayerBigWin = isBigWin && isMainPlayer;
        if (isMainPlayerBigWin) {
            await FunctionUtils.delay(100);
            this.playSound(SoundNameList.bigWin);
            this.spineTree.setAnimation(1, AnimationNameTree.bigWinCoin, false);
        } else {
            const coinAnimationPlaying =
                AnimationUtils.isAnimationPlaying(this.spineTree, AnimationNameTree.bigWinCoin) ||
                AnimationUtils.isAnimationPlaying(this.spineTree, AnimationNameTree.normalWinCoin);
            if (!coinAnimationPlaying) {
                this.spineTree.setAnimation(2, AnimationNameTree.normalWinCoin, false);
                this.playSound(this.getCoinsDropSound());
            }
        }

        if (!isTreeAnimPlaying || callNewAnimation) {
            try {
                const stamp = Date.now();
                this.treeTimeStamp = stamp;
                await this.playAnim(this.spineTree, treeAnimation, false);
                if (this.treeTimeStamp === stamp) {
                    this.forceNewAnimation = false;
                    this.playAnim(this.spineTree, AnimationNameTree.idle, true);
                }
            } catch (e) {}
        }
    }

    private releaseSlot(index: number) {
        const slot = this.slots[index];
        if (slot.timeoutId) {
            clearTimeout(slot.timeoutId);
        }

        this.slots[index] = {
            used: false,
            usageCount: 0,
            playerId: undefined,
            timeoutId: undefined,
        };
    }

    private getRandomSlot(playerId: string): number {
        const existingSlot = Object.entries(this.slots).find(([_, info]) => info.playerId === playerId);
        if (existingSlot) {
            const [index] = existingSlot;
            const slotIndex = Number(index);
            const slotInfo = this.slots[slotIndex];

            slotInfo.usageCount++;

            if (slotInfo.timeoutId) {
                clearTimeout(slotInfo.timeoutId);
            }
            slotInfo.timeoutId = setTimeout(() => {
                this.releaseSlot(slotIndex);
            }, this.SLOT_TIMEOUT);

            return slotIndex;
        }

        const availableSlots = Object.entries(this.slots)
            .filter(([_, info]) => !info.used)
            .map(([index]) => Number(index));

        const randomIndex = availableSlots[math.randomRangeInt(0, availableSlots.length)];
        const timeoutId = setTimeout(() => {
            this.releaseSlot(randomIndex);
        }, this.SLOT_TIMEOUT);

        this.slots[randomIndex] = {
            used: true,
            usageCount: 1,
            playerId: playerId,
            timeoutId: timeoutId,
        };

        return randomIndex;
    }

    private checkAvailableSlot() {
        const availableSlots = Object.entries(this.slots)
            .filter(([_, info]) => !info.used)
            .map(([index]) => Number(index));

        return availableSlots.length > 0;
    }

    private getPositionFromSlot(slotIndex: number): math.Vec3 {
        const slots = this.randomArea.children;
        return slots[slotIndex].worldPosition;
    }

    private getRandomWorldPosition(playerId: string): math.Vec3 {
        const slotIndex = this.getRandomSlot(playerId);
        return this.getPositionFromSlot(slotIndex);
    }

    private initUsedSlot() {
        const count = this.randomArea.children.length;
        for (let i = 0; i < count; i++) {
            this.slots[i] = {
                used: false,
                usageCount: 0,
                playerId: undefined,
            };
        }
    }

    private createNotice(prefab: Prefab) {
        const noticeNode = instantiate(prefab);
        const notice = noticeNode.getComponent(BetWinNotice);
        this.container.addChild(noticeNode);

        return notice;
    }

    private showMainPlayerNotice(betWin: number, bigWin: boolean) {
        if (!this.gameVisible) {
            return;
        }
        const notice = this.createNotice(this.prfMainPlayerNotice);

        notice.setBetWin(betWin);

        if (bigWin) {
            notice.node.scale = v3(1, 1, 1).multiplyScalar(1.5);
        }
        this.flyToBalance(notice.node);
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playSFX(id))
    playSound(id: string) {
        return id;
    }

    private flyToBalance(node: Node) {
        const position = AnimationUtils.getPositionAtDestNode(node, this.balanceNode).add(v3(0, 20));

        const flyUpY = 120;
        const startPosition = v3(node.position.x, node.position.y + flyUpY);
        const delta = position.subtract(startPosition);
        tween(node)
            .by(
                0.7,
                {
                    position: v3(0, flyUpY),
                },
                {
                    easing: "sineOut",
                }
            )
            .to(
                0.5,
                {
                    scale: v3(1, 1, 0),
                },
                {
                    easing: "sineInOut",
                    onUpdate: (node, dt: number) => {
                        var y = 1 - dt * dt;
                        y += delta.y * dt;
                        y += startPosition.y;

                        var x = delta.x * dt;
                        node.position = v3(x, y);
                    },
                }
            )
            .to(0.1, { scale: v3(0, 0) })
            .call(() => {
                this.playSound(SoundNameList.normalWin);
                this.updateBalance();
                node.destroy();
            })
            .start();
    }

    @handle(BalanceInfoHandler, (handle) => handle.updateBalance())
    @handle(gc.Auth.AuthHandlers.GetBalance)
    private updateBalance() {}

    private showOtherWinnerNotice(id: string, name: string, betWin: number, avatarId?: number) {
        if (!this.gameVisible) {
            return;
        }
        const notice = this.createNotice(this.prfOtherWinNotice);
        const noticeNode = notice.node;

        noticeNode.worldPosition = this.getRandomWorldPosition(id);
        const updateInfo = () => {
            notice.setName(name);
            notice.flyUp(betWin, true, () => {
                noticeNode.destroy();
            });
        };
        if (avatarId !== undefined) {
            noticeNode.active = false;
            notice.setAvatar(avatarId).then((success) => {
                if (success) {
                    noticeNode.active = true;
                    updateInfo();
                } else {
                    noticeNode.destroy();
                }
            });
        } else {
            updateInfo();
        }
    }

    async playAnim(spine: sp.Skeleton, animName: string, isLoop: boolean) {
        await AnimationUtils.playSpine(spine, animName, isLoop);
    }

    getDurationAnim(spine: sp.Skeleton, animationName: string) {
        const animation = spine.findAnimation(animationName);
        if (!animation) {
            return 0;
        }

        return animation?.duration ?? 0;
    }

    getCoinsDropSound() {
        const coinsdropSound = `coinsDrop${math.randomRangeInt(1, 3)}`;
        return SoundNameList[coinsdropSound];
    }
}
