import {AxiosError} from 'axios';
import {toast} from 'sonner';
import type {
	DefaultError,
	Mutation,
	Query
} from '@tanstack/react-query';
import {useAuthStore} from '@/stores/authStore.ts';
import type {RegisteredRouter} from '@tanstack/react-router';
import axios from 'axios';
import DateTime from '@/utils/DateTime.ts';

// Create a standalone axios instance for token refresh to avoid circular dependency
const refreshTokenInstance = axios.create({
	baseURL: 'http://103.178.231.211:9201/',
	headers: {
		'Content-Type': 'application/json',
		TimeZone: DateTime.TimeZone()
	},
	timeout: 10 * 60 * 1000
});

let isRedirecting = false;
let isRefreshing = false;
let retryCount = 0;
const maxRetryCount = 1;
let failedQueue: {
	query?: Query<unknown, unknown, unknown, readonly unknown[]>;
	mutation?: Mutation<unknown, unknown, unknown, unknown>;
	variables?: unknown;
	resolve: (value?: unknown) => void;
	reject: (reason?: unknown) => void;
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
		const waitForRefresh = new Promise((resolve, reject) => {
			failedQueue.push({
				query,
				mutation,
				variables,
				resolve,
				reject
			});
		});
		
		if(!isRefreshing) {
			isRefreshing = true;
			
			try {
				const refreshToken = useAuthStore.getState().auth.refreshToken;
				if (!refreshToken) {
					throw new Error('No refresh token available');
				}
				
				const response = await refreshTokenInstance.post(
					`auth/refresh-token?tokenRefresh=${refreshToken}`
				);
				
				if (response.status === 200) {
					const { accessToken, refreshToken: newRefreshToken } = response.data.responseData;
					
					useAuthStore.getState().auth.setAccessToken(accessToken);
					useAuthStore.getState().auth.setRefreshToken(newRefreshToken);
					
					processFailedQueue();
				} else {
					throw new Error('Token refresh failed');
				}
			} catch (error) {
				failedQueue.forEach(promise => {
					promise.reject(error);
				});
				failedQueue = [];
				throw error;
			} finally {
				isRefreshing = false;
			}
		}
		
		return await waitForRefresh;
	}
	catch (error) {
		useAuthStore.getState()
			.auth
			.reset();
		if(!isRedirecting) {
			isRedirecting = true;
			toast.error('Session expired!');
			const redirect = `${router.history.location.href}`;
			router.navigate({
				to: '/sign-in',
				search: {redirect}
			});
		}
		throw error;
	}
};

const processFailedQueue = () => {
	failedQueue.forEach(item => {
		const {
			query,
			mutation,
			variables,
			resolve
		} = item;
		
		try {
			if(retryCount > maxRetryCount) return;
			if(mutation) {
				const {options} = mutation;
				mutation.setOptions({...options});
				mutation.execute(variables);
			}
			if(query) query.fetch(query.options);
			resolve();
		} catch (error) {
			item.reject(error);
		}
	});
	failedQueue = [];
};
