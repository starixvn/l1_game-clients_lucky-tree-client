import inversify from "inversify";
import mobx from "mobx";

const { injectable, inject } = inversify;

@injectable()
export class HoldActionStore {
    isPressingKey = false;
    constructor() {
        mobx.makeAutoObservable(this);
    }
}
