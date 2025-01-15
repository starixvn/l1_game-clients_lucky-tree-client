import { _decorator, Color } from "cc";
import { BetHistoryNewBodyItem } from "db://shared-components/game/bet-history-new/scripts/bet-history-new-body-item";
import { BetHistoryBodyItemType } from "db://shared-components/game/bet-history/scripts/components/bet-history-body-item";
const { ccclass, property } = _decorator;

@ccclass("instant_win_bet_history_body_item")
export class InstantWinBetHistoryBodyItem extends BetHistoryNewBodyItem {
    setData(data: BetHistoryBodyItemType) {
        const { betwin } = data.betHistoryLog;
        super.setData(data);
        this.lblWin.color = betwin > 0 ? new Color().fromHEX("F1E344") : new Color().fromHEX("ffffff");
    }
}
