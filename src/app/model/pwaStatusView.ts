export type PwaOfflineStatus =
	| { readonly kind: "checking" }
	| { readonly kind: "ready" }
	| { readonly kind: "unsupported" }
	| { readonly kind: "failed" };

export interface PwaStatusView {
	readonly label: string;
	readonly tone: "pending" | "ready" | "warning";
}

export function createPwaStatusView(status: PwaOfflineStatus): PwaStatusView {
	switch (status.kind) {
		case "checking":
			return {
				label: "Preparando modo offline...",
				tone: "pending",
			};
		case "ready":
			return {
				label: "Offline disponível neste navegador.",
				tone: "ready",
			};
		case "unsupported":
			return {
				label: "Modo offline indisponível neste navegador.",
				tone: "warning",
			};
		case "failed":
			return {
				label: "Não foi possível preparar o modo offline.",
				tone: "warning",
			};
	}
}
