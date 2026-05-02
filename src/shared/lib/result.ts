export type Result<Success, Failure> =
	| { readonly success: true; readonly data: Success }
	| { readonly success: false; readonly error: Failure };

export function ok<Success>(data: Success): Result<Success, never> {
	return { success: true, data };
}

export function fail<Failure>(error: Failure): Result<never, Failure> {
	return { success: false, error };
}
