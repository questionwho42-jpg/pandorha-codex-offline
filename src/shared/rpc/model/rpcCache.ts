export class RpcCache {
	private readonly cache = new Map<string, unknown>();

	public get(type: string, payload: unknown): unknown | null {
		const key = this.getKey(type, payload);
		const cached = this.cache.get(key);
		return cached !== undefined ? cached : null;
	}

	public set(type: string, payload: unknown, value: unknown): void {
		const key = this.getKey(type, payload);
		this.cache.set(key, value);
	}

	public invalidate(type: string): void {
		if (this.isMutation(type)) {
			this.cache.clear();
		}
	}

	private getKey(type: string, payload: unknown): string {
		return `${type}:${JSON.stringify(payload)}`;
	}

	private isMutation(type: string): boolean {
		return (
			!type.startsWith("LOAD_") &&
			!type.startsWith("FIND_") &&
			!type.startsWith("LIST_") &&
			type !== "INIT_DATABASE"
		);
	}
}

export const rpcCache = new RpcCache();
