import gc from "@sg/game-client-base";
import inversify from "inversify";

const { injectable, inject } = inversify;

@injectable()
export class NullOtherPlayersHandlers extends gc.AroundTablePlayers.AroundTablePlayerHandlers {
    eventHandleList = [];
}
