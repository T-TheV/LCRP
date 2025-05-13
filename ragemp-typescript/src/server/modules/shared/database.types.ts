/// <reference path="../../@types/rage-mp/index.d.ts" />

export interface Database {
    connect(): void;
    disconnect(): void;
}

export const logDatabaseAction = (action) => {
    mp.console.logInfo(`[Servidor] Aqui deveria registrar a ação de banco de dados: ${action}.`);
};