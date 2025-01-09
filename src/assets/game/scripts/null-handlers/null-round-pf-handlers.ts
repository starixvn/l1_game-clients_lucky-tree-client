import gc from "@sg/game-client-base";
import inversify from "inversify";

const { injectable, inject } = inversify;

@injectable()
export class NullRoundPFHandlers extends gc.RoundPF.RoundPFHandler {
    eventHandleList = [];
}
