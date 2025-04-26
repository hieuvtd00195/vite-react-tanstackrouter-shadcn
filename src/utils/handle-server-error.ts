import {AxiosError} from 'axios';
import {toast} from 'sonner';
import type {
	DefaultError,
	Mutation,
	Query
} from '@tanstack/react-query';
import {useAuthStore} from '@/stores/authStore.ts';
import type {RegisteredRouter} from '@tanstack/react-router';

let isRedirecting = false;
let isRefreshing = false;
let retryCount = 0;
const maxRetryCount = 1;
let failedQueue: {
	query?: Query<unknown, unknown, unknown, readonly unknown[]>;
	mutation?: Mutation<unknown, unknown, unknown, unknown>;
	variables?: unknown;
}[] = [];

export function handleServerError(error: unknown) {
	// eslint-disable-next-line no-console

	let errMsg = 'Something went wrong!';

	if(
		error &&
		typeof error === 'object' &&
		'status' in error &&
		Number(error.status) === 204
	) {
		errMsg = 'Content not found.';
	}

	if(error instanceof AxiosError) {
		errMsg = error.response?.data.error;
	}

	toast.error(errMsg);
}

export const handleQueryError = (
	router: RegisteredRouter,
	error: DefaultError,
	query: Query<unknown, unknown, unknown, readonly unknown[]>
) => {
	handleError(router, error, query);
};

export const handleMutationError = (
	router: RegisteredRouter,
	error: DefaultError,
	variables: unknown,
	context: unknown,
	mutation: Mutation<unknown, unknown, unknown, unknown>
) => {
	handleError(router, error, undefined, mutation, variables, context);
};

const handleError = (
	router: RegisteredRouter,
	error: any,
	query?: Query<unknown, unknown, unknown, readonly unknown[]>,
	mutation?: Mutation<unknown, unknown, unknown, unknown>,
	variables?: unknown,
	_?: unknown
) => {
	handleServerError(error);

	if(error.responseCode === '401') {
		if(retryCount > maxRetryCount) {
			failedQueue = []
			mutation?.destroy()
			query?.destroy()
			toast.error('Session expired!');
			router.navigate({
				to: '/sign-in'
			});
			return;
		}

		if(mutation) {
			refreshTokenAndRetry(router, undefined, mutation, variables);
		} else {
			refreshTokenAndRetry(router, query);
		}
	}
	if(error.responseCode === '500') {
		toast.error('Internal Server Error!');
		router.navigate({to: '/500'});
	}
	if(error.responseCode === '403') {
		// router.navigate("/forbidden", { replace: true });
	}

	if(error.responseCode === '304') {
		toast.error('Content not modified!');
	}

};

const refreshTokenAndRetry = async (
	router: RegisteredRouter,
	query?: Query<unknown, unknown, unknown, readonly unknown[]>,
	mutation?: Mutation<unknown, unknown, unknown, unknown>,
	variables?: unknown
) => {
	try {
		retryCount++;
		if(!isRefreshing) {
			isRefreshing = true;
			failedQueue.push({
				query,
				mutation,
				variables
			});
			// const { accessToken, refreshToken: newRefreshToken } = await refreshToken(
			// 	{
			// 		refreshToken: getRefreshToken()!,
			// 	}
			// );
			useAuthStore.getState()
				.auth
				.setAccessToken('');
			useAuthStore.getState()
				.auth
				.setRefreshToken('');
			processFailedQueue();
		} else {
			failedQueue.push({
				query,
				mutation,
				variables
			});
		}
	}
	catch {
		useAuthStore.getState()
			.auth
			.reset();
		if(!isRedirecting) {
			isRedirecting = true;
			// window.location.href = "/auth/session-expired";
			toast.error('Session expired!');
			const redirect = `${router.history.location.href}`;
			router.navigate({
				to: '/sign-in',
				search: {redirect}
			});
		}
	}
};



const processFailedQueue = () => {
	failedQueue.forEach(({
		query,
		mutation,
		variables
	}) => {
		if(retryCount > maxRetryCount) return;
		if(mutation) {
			const {options} = mutation;
			mutation.setOptions({...options});
			mutation.execute(variables);
		}
		if(query) query.fetch(query.options);
	});
	isRefreshing = false;
	failedQueue = [];
};
