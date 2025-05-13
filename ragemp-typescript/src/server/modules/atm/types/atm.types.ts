export {};

// Tipos relacionados ao ATM
declare global {
    interface PlayerMp {
        hasMoney(amount: number): boolean;
        removeMoney(amount: number): void;
        addMoney(amount: number): void;
        call(eventName: string, args?: any[]): void;
        outputChatBox(message: string): void;
    }
}