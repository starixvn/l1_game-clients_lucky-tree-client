import gc from "@sg/game-client-base";
import inversify from "inversify";

const { injectable, inject } = inversify;

@injectable()
export class NullRoundTimeHandlers extends gc.Rounds.RoundTimeHandlers {
    eventHandleList = [];
}
