export type SaveLoadUiState =
	| { readonly kind: "initializing" }
	| { readonly kind: "ready" }
	| { readonly kind: "saving" }
	| { readonly kind: "saved" }
	| { readonly kind: "loading" }
	| { readonly kind: "loaded" }
	| { readonly kind: "error"; readonly message: string };

export interface SaveLoadView {
	readonly statusLabel: string;
	readonly canSave: boolean;
	readonly canLoad: boolean;
}

export function createSaveLoadView(state: SaveLoadUiState): SaveLoadView {
	switch (state.kind) {
		case "initializing":
			return {
				statusLabel: "Preparando save local...",
				canSave: false,
				canLoad: false,
			};
		case "ready":
			return {
				statusLabel: "Save local pronto.",
				canSave: true,
				canLoad: true,
			};
		case "saving":
			return {
				statusLabel: "Salvando sessão...",
				canSave: false,
				canLoad: false,
			};
		case "saved":
			return {
				statusLabel: "Sessão salva neste navegador.",
				canSave: true,
				canLoad: true,
			};
		case "loading":
			return {
				statusLabel: "Carregando save...",
				canSave: false,
				canLoad: false,
			};
		case "loaded":
			return {
				statusLabel: "Save carregado.",
				canSave: true,
				canLoad: true,
			};
		case "error":
			return {
				statusLabel: state.message,
				canSave: true,
				canLoad: true,
			};
	}
}
