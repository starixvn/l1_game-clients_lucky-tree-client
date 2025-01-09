import { Node } from "cc";
import BetAmount from "../components/bet-amount/components/bet-amount";

export const betUtils = {
    hideBetLevelsContainer(node: Node) {
        const betAmountNode = node.parent.getChildByName('bet-amount');
        if (betAmountNode) {
            const betAmountComponent = betAmountNode.getComponent(BetAmount);
            if (betAmountComponent) {
                betAmountComponent.onClickOverlayBg();
            }
        }
    }
}; 