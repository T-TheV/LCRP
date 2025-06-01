declare global {
	interface PlayerMp {

		hasFactionPermission?(permission: string): boolean;
		hasCompanyPermission?(permission: string): boolean;
		getVariable(name: string): any;
		
		// Flags de sistema
		isAdmin?: boolean;
		isArchitect?: boolean;
		invincible: boolean;

		// Identificadores
		characterId?: string;
		currentPropertyId?: string;

		// Mobília em manipulação
		dropFurniture?: {
			id?: string;
			model: string;
			propertyId?: string;
			posX?: number;
			posY?: number;
			posZ?: number;
			rotX?: number;
			rotY?: number;
			rotZ?: number;
			interior: boolean;
		};

		// Métodos utilitários
		sendNotification(type: 'success' | 'error' | 'info', message: string): void;
		sendMessage(message: string): void;
	}
}

export { };
// Este arquivo é um ponto de extensão para adicionar tipos personalizados ao PlayerMp
// e outros objetos do RAGE Multiplayer.