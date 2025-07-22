

const GAME_NAME = "TapFortune";

export const settings = {
    id: 107,
    name: GAME_NAME,
    observerNamespace: GAME_NAME,
    namespaces: [GAME_NAME, "TapGame"],
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

