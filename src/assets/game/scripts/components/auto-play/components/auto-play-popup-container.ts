import { _decorator } from "cc";
import { Dialog } from "db://shared-components/shared/common-components/dialogs/dialog";
import { NodeContainer } from "db://shared-components/shared/common-components/node-container/node-container";
import Observer from "observer";
import { AutoPlayStore } from "../auto-play-store";

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass
export class AutoPlayPopupContainer extends NodeContainer {
    @render(AutoPlayStore, (store) => store.isOpenAutoplayPopup)
    renderOpenPopup(isOpenAutoPlayPopup: boolean) {
        if (!isOpenAutoPlayPopup) {
            const nodes = this.node.children;
            if (nodes.length > 0) {
                nodes[0].getComponent(Dialog)?.hide();
            }
            return;
        }

        this.createNode();
    }
}
