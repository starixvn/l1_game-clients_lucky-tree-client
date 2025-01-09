import gc from "@sg/game-client-base";
import { LogStore } from "db://shared-components/game/scripts/stores/log-store";
import * as InstantWinFeature from "../scripts";

import { sharedContainer } from "../../scripts/shared-container";
import { NullJoinMiniGasmeHandlers } from "./null-handlers/null-join-mini-game-handlers";
import { NullOtherPlayersHandlers } from "./null-handlers/null-other-players-handlers";
import { NullRoundPFHandlers } from "./null-handlers/null-round-pf-handlers";
import { NullRoundTimeHandlers } from "./null-handlers/null-round-time-handlers";

export const settings = {
    id: 107,
    name: "Tapfortune",
    namespaces: ["TapFortune", "TapGame"],
    durations: {
        wholeRound: 14,
        lockingBet: 3,
        placingBet: 10,
        generatingResult: 0,
        startRound: 1,
    },
    numberOfRoundHistory: 11,
    validateBalanceWhenBet: true,
};

export const containerOptions: gc.IContainerOptions = {
    globalContainer: sharedContainer,
    onContainerCreated: (container) => {
        container.bind(gc.GameConfigs.GameSetting).toConstantValue(settings);
        container.bind(LogStore).to(LogStore);

        container.bind(gc.Rounds.RoundTimeHandlers).to(NullRoundTimeHandlers);
        container.bind(gc.RoundPF.RoundPFHandler).to(NullRoundPFHandlers);
        container.bind(gc.AroundTablePlayers.AroundTablePlayerHandlers).to(NullOtherPlayersHandlers);
        container.bind(gc.JoinGame.JoinMiniGameHandlers).to(NullJoinMiniGasmeHandlers);
    },
    features: [InstantWinFeature, ...gc.defaultFeatures],
};
