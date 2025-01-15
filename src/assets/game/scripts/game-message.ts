export namespace GameServiceMessage {
    export class InstantGameConfigs {
        defaultBetLevel: number;
        betLevels: number[];

        static eventName = "gameConfigs";
    }

    export class Winner {
        name: string;
        betWin: number;
        bigWin: boolean;

        static eventName = "winner";
    }
}
