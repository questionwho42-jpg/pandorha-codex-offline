export type PwaOfflineStatus =
	| { readonly kind: "checking" }
	| { readonly kind: "ready" }
	| { readonly kind: "unsupported" }
	| { readonly kind: "failed" };

export interface PwaStatusView {
	readonly label: string;
	readonly tone: "pending" | "ready" | "warning";
}

export type PwaInstallStatus =
	| { readonly kind: "unavailable" }
	| { readonly kind: "available" }
	| { readonly kind: "installing" }
	| { readonly kind: "accepted" }
	| { readonly kind: "dismissed" }
	| { readonly kind: "failed" };

export interface PwaInstallView {
	readonly label: string;
	readonly buttonLabel: string;
	readonly isVisible: boolean;
	readonly canInstall: boolean;
	readonly tone: "pending" | "ready" | "warning";
}

export type PwaUpdateStatus =
	| { readonly kind: "idle" }
	| { readonly kind: "available" }
	| { readonly kind: "applying" }
	| { readonly kind: "failed" };

export interface PwaUpdateView {
	readonly label: string;
	readonly buttonLabel: string;
	readonly isVisible: boolean;
	readonly canApply: boolean;
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

export function createPwaInstallView(status: PwaInstallStatus): PwaInstallView {
	switch (status.kind) {
		case "unavailable":
			return {
				label: "Instalação disponível quando o navegador liberar.",
				buttonLabel: "Instalar app",
				isVisible: false,
				canInstall: false,
				tone: "pending",
			};
		case "available":
			return {
				label: "Instalação disponível neste navegador.",
				buttonLabel: "Instalar app",
				isVisible: true,
				canInstall: true,
				tone: "ready",
			};
		case "installing":
			return {
				label: "Abrindo instalação do app...",
				buttonLabel: "Instalar app",
				isVisible: true,
				canInstall: false,
				tone: "pending",
			};
		case "accepted":
			return {
				label: "Instalação aceita pelo navegador.",
				buttonLabel: "Instalar app",
				isVisible: true,
				canInstall: false,
				tone: "ready",
			};
		case "dismissed":
			return {
				label: "Instalação dispensada neste momento.",
				buttonLabel: "Instalar app",
				isVisible: true,
				canInstall: false,
				tone: "warning",
			};
		case "failed":
			return {
				label: "Não foi possível iniciar a instalação.",
				buttonLabel: "Instalar app",
				isVisible: true,
				canInstall: false,
				tone: "warning",
			};
	}
}

export function createPwaUpdateView(status: PwaUpdateStatus): PwaUpdateView {
	switch (status.kind) {
		case "idle":
			return {
				label: "Nenhuma atualização pendente.",
				buttonLabel: "Atualizar agora",
				isVisible: false,
				canApply: false,
				tone: "pending",
			};
		case "available":
			return {
				label: "Atualização disponível.",
				buttonLabel: "Atualizar agora",
				isVisible: true,
				canApply: true,
				tone: "ready",
			};
		case "applying":
			return {
				label: "Aplicando atualização...",
				buttonLabel: "Atualizar agora",
				isVisible: true,
				canApply: false,
				tone: "pending",
			};
		case "failed":
			return {
				label: "Não foi possível aplicar a atualização.",
				buttonLabel: "Atualizar agora",
				isVisible: true,
				canApply: false,
				tone: "warning",
			};
	}
}
