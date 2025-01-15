import gc from "@sg/game-client-base";
import { _decorator, instantiate, Node, Prefab } from "cc";
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { IWinInstantResult } from "../../game";
import { IWinner, LeaderBoardStore } from "../leader-board-store";
import { Winner } from "./winner";

const { Connection, Settlements } = gc;
const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;
@ccclass("leader_board_container")
export class LeaderBoardContainer extends ObserverComponent {
    @property(Node)
    nodeWinners: Node = null;

    @property(Prefab)
    prfWinner: Prefab = null;

    @property(Node)
    nodeMainPlayer: Node = null;

    private nameMainPlayer = "";

    onLoad() {
        super.onLoad();
        this.nodeMainPlayer.active = false;
    }

    @render(LeaderBoardStore, (store) => store.winner, { fireImmediately: false })
    showWinners(winner: IWinner) {
        //const winnersOnBoard = this.nodeMainPlayer.active ? winners.slice(0, winners.length - 1) : winners;
        const nodeWinner = instantiate(this.prfWinner);
        nodeWinner.getComponent(Winner).setData(winner);
        this.nodeWinners.addChild(nodeWinner);
    }

    @render(Settlements.SettlementStore, (store) => store.result, { fireImmediately: false })
    showMainPlayer(result: IWinInstantResult) {
        if (result.betWin > 0) {
            this.nodeMainPlayer.active = true;
            this.nodeMainPlayer.getComponent(Winner).setData({ name: this.nameMainPlayer, betWin: result.betWin });
        }
    }

    @render(gc.Player.MainPlayerStore, (store) => store.name)
    getNameMainPlayer(name: string) {
        this.nameMainPlayer = name;
    }
}
