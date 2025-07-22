import { GameConfigs } from "@sg/game-client-base";
import { LogStore } from "db://shared-components/game/scripts/stores/log-store";

import { settings } from "../../../assets/game/scripts/game-settings";
import { containerOptions } from "../../../assets/game/scripts/containerOptions";

jest.mock("db://shared-components/shared/scripts/startup", () => ({
    getSharedContainer: jest.fn(() => ({ sharedContainer: true })),
}));

describe("settings", () => {
    it("should have data as expected", () => {
        // Assert
        expect(settings).toStrictEqual({
            id: 107,
            name: "TapFortune",
            observerNamespace: "TapFortune",
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
        });
    });
});

describe("when container created", () => {
    let container;
    let bind: jest.Mock;
    let toConstantValue: jest.Mock;
    let to: jest.Mock;

    beforeEach(() => {
        toConstantValue = jest.fn();
        to = jest.fn();
        bind = jest.fn().mockImplementation(() => ({ toConstantValue, to }));

        container = { bind };
    });

    it("should bind GameSetting", () => {
        // Act
        containerOptions.onContainerCreated(container);

        // Assert
        expect(bind).toBeCalledWith(GameConfigs.GameSetting);
        expect(toConstantValue).toBeCalledWith(settings);
    });

    it("should bind LogStore", () => {
        // Act
        containerOptions.onContainerCreated(container);

        // Assert
        expect(bind).toBeCalledWith(LogStore);
        expect(to).toBeCalledWith(LogStore);
    });
});
