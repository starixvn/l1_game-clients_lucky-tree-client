import gc from "@sg/game-client-base";
import { FunctionUtils } from "db://shared-components/shared/utils";
import inversify from "inversify";
import mobx from "mobx";
import { BetAmountStore } from "../bet-amount/bet-amount-store";
import { AutoPlayStore } from "./auto-play-store";

const { injectable, inject } = inversify;

@injectable()
export class AutoPlayHandler implements gc.Shared.IHandler<number> {
    @inject(AutoPlayStore) protected readonly autoPlayStore: AutoPlayStore;
    @inject(gc.Bet.BetStore) private readonly betStore: gc.Bet.BetStore;
    @inject(BetAmountStore) protected readonly betAmountStore: BetAmountStore;
    @inject(gc.Notices.NoticeStore) private readonly noticeStore: gc.Notices.NoticeStore;
    @inject(gc.Error.ErrorStore) private readonly errorStore: gc.Error.ErrorStore;
    @inject(gc.Rounds.RoundStore) private readonly roundStore: gc.Rounds.RoundStore;
    constructor() {
        mobx.makeAutoObservable(this);
        setTimeout(() => {
            mobx.reaction(
                () => this.errorStore.apiError,
                (apiError) => {
                    if (apiError) {
                        this.cancelAutoPlay();
                    }
                }
            );
        }, 0);
    }

    handle() {}

    async handleAutoPlaceBet() {
        if (this.checkFinishedAutoPlay() || !this.isValidBet()) {
            this.autoPlayStore.isAutoplay = false;
            this.autoPlayStore.isOpenAutoplayPopup = true;
            return;
        }
        const delayNextRoundDuration = this.autoPlayStore.isTurboMode ? 200 : 1000;
        await FunctionUtils.delay(delayNextRoundDuration);
        this.updateAutoPlayRounds(this.autoPlayStore.roundsAutoplay - 1);
        this.autoPlaceBet();
    }

    autoPlaceBet() {
        this.autoPlayStore.triggerBet = {};
    }

    openAutoPlayPopup() {
        this.autoPlayStore.isOpenAutoplayPopup = true;
        this.autoPlayStore.selectedRoundOnPopup = this.autoPlayStore.roundsList[0];
    }

    clickAutoPlay() {
        if (!this.autoPlayStore.isAutoplay && this.isValidBet()) {
            this.openAutoPlayPopup();
        } else {
            this.cancelAutoPlay();
        }
    }

    cancelAutoPlay() {
        this.autoPlayStore.isAutoplay = false;
        this.updateAutoPlayRounds(0);
    }

    isValidBet() {
        if (!this.isEnoughMoney()) {
            this.showNotEnoughMoney();
            return false;
        }

        return true;
    }

    isEnoughMoney() {
        return this.betStore.amount <= this.betStore.availableBalance;
    }

    isAmountGreaterMinBet() {
        return this.betStore.amount >= this.roundStore.minBet;
    }

    private showNotEnoughMoney() {
        const { freebetEnabled } = this.betStore;
        const message = freebetEnabled
            ? gc.Translator.commonTranslate("not_enough_scoin")
            : gc.Translator.commonTranslate("not_enough_money");
        this.noticeStore.addWarning(message);
    }

    showMsgMinBet() {
        this.noticeStore.addWarning(gc.Translator.commonTranslate("message_min_bet_notice", { minBet: this.roundStore.minBet }));
    }

    closeAutoPlayPopup() {
        this.autoPlayStore.isOpenAutoplayPopup = false;
    }

    confirmRoundAndStart() {
        this.autoPlayStore.roundsAutoplay = this.autoPlayStore.selectedRoundOnPopup;
        this.autoPlayStore.isOpenAutoplayPopup = false;
        if (this.isValidBet()) {
            this.autoPlayStore.isAutoplay = true;
            this.autoPlaceBet();
            this.updateAutoPlayRounds(this.autoPlayStore.roundsAutoplay - 1);
        } else {
            this.cancelAutoPlay();
        }
    }

    updateAutoPlayRounds(rounds: number) {
        this.autoPlayStore.roundsAutoplay = rounds;
    }

    checkFinishedAutoPlay() {
        return this.autoPlayStore.isAutoplay && this.autoPlayStore.roundsAutoplay <= 0;
    }

    checkSpinNextRound() {
        if (!this.autoPlayStore.isAutoplay) {
            return;
        }
        this.handleAutoPlaceBet();
    }

    updateNoOfRounds(rounds: number) {
        this.autoPlayStore.selectedRoundOnPopup = rounds;
    }

    handleTurboMode(isTurboMode: boolean) {
        this.autoPlayStore.isTurboMode = isTurboMode;
    }
}
