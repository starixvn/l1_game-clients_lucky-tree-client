import gc from "@sg/game-client-base";
import { _decorator, Component, Label } from "cc";
const { ccclass, property } = _decorator;

@ccclass("winner")
export class Winner extends Component {
    @property(Label)
    lblName: Label = null;

    @property(Label)
    lblBetWin: Label = null;

    setData(data: any) {
        this.lblName.string = this.encryptedName(data.name);
        this.lblBetWin.string = `+${gc.FormatUtils.numberWithCommas(data.betWin, 2)}`;
    }

    private encryptedName(name: string): string {
        return `${name.substring(0, 1)}***${name.substring(name.length - 3, name.length)}`;
    }
}
