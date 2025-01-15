import inversify from "inversify";
import mobx from "mobx";

const { injectable, inject } = inversify;

export interface IWinner {
    id: string;
    name: string;
    betWin: number;
    bigWin: boolean;
    rate: number;
    avatarId: number;
}

@injectable()
export class LeaderBoardStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }

    private _winner: IWinner = null;

    get winner() {
        return this._winner;
    }

    set winner(winner: IWinner) {
        this._winner = winner;
    }
}
