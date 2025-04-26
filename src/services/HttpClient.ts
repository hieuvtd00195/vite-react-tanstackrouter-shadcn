import SessionStorage from '@/utils/SessionStorage'
import type {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse
} from 'axios'
import axios from 'axios'
import DateTime from '@/utils/DateTime.ts';
import {ACCESS_TOKEN, REFRESH_TOKEN, useAuthStore} from '@/stores/authStore.ts';

// For token refresh
let isRefreshing = false;
interface QueueItem {
	resolve: (value?: unknown) => void;
	reject: (reason?: unknown) => void;
}
let failedQueue: QueueItem[] = [];

// Create a standalone axios instance for token refresh to avoid circular dependency
const refreshTokenInstance = axios.create({
	baseURL: 'http://103.178.231.211:9201/',
	headers: {
		'Content-Type': 'application/json',
		TimeZone: DateTime.TimeZone()
	},
	timeout: 10 * 60 * 1000
});

const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

// Will be used to update all instance headers after token refresh
let axiosInstances: AxiosInstance[] = [];

class Axios {
	private instance: AxiosInstance

	constructor(configService: AxiosRequestConfig) {
		const instance = axios.create(configService)

		// Request interceptor
		instance.interceptors.request.use(
			(config) => {
				const accessToken = this.getAccessToken()
				if (config.headers) {
					if (accessToken) {
						config.headers.Authorization = accessToken
					} else {
						delete config.headers.Authorization
					}
				}

				return config
			},
			(error) => Promise.reject(error)
		)
		
		instance.interceptors.response.use(
			response => response,
			async (error: AxiosError) => {
				const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
				
				if (error.response?.status === 401 && !originalRequest._retry) {
					if (isRefreshing) {
						return new Promise((resolve, reject) => {
							failedQueue.push({ resolve, reject });
						})
							.then(token => {
								if (originalRequest.headers && typeof token === 'string') {
									originalRequest.headers.Authorization = token;
								}
								return axios(originalRequest);
							})
							.catch(err => Promise.reject(err));
					}
					
					originalRequest._retry = true;
					isRefreshing = true;
					
					try {
						const refreshToken = SessionStorage.get(REFRESH_TOKEN);
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
							
							axios.defaults.headers.common.Authorization = accessToken;
							if (originalRequest.headers) {
								originalRequest.headers.Authorization = accessToken;
							}
							
							axiosInstances.forEach(instance => {
								if (instance.defaults.headers) {
									instance.defaults.headers.common = instance.defaults.headers.common || {};
									instance.defaults.headers.common.Authorization = accessToken;
								}
							});
							
							processQueue(null, accessToken);
							
							return axios(originalRequest);
						}
					} catch (err) {
						processQueue(err, null);
						useAuthStore.getState().auth.reset();
						return Promise.reject(err);
					} finally {
						isRefreshing = false;
					}
				}
				
				return Promise.reject(error);
			}
		);

		this.instance = instance
		// Register this instance for token refresh updates
		axiosInstances.push(instance);
	}

	public get Instance() {
		return this.instance
	}


	private getAccessToken() {
		const accessToken: string | null = SessionStorage.get(ACCESS_TOKEN)
		return accessToken
	}

	// Create
	public post<D = any>(url: string): Promise<D>
	public post<D = any, R = any>(url: string, data: D, config?: AxiosRequestConfig<D>): Promise<R>
	public post<D = any, R = any>(
		url: string,
		data: D,
		config: AxiosRequestConfig<D> & { integrity: true }
	): Promise<AxiosResponse<R, D>>
	public post<D, R>(url: string, data?: D, config: any = {}): Promise<unknown> {
		const {
			integrity,
			...rest
		} = config
		return new Promise((resolve, reject) => {
			this.Instance.post<D, AxiosResponse<R>>(url, data, rest)
				.then((response) => resolve(integrity ? response : response.data))
				.catch((error: AxiosError) => reject(error.response?.data))
		})
	}

	// Read
	public get<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R> {
		return new Promise((resolve, reject) => {
			this.Instance.get<T, AxiosResponse<R>, D>(url, config)
				.then((response) => resolve(response.data))
				.catch((error: AxiosError) => reject(error.response?.data))
		})
	}

	// Update
	public put<D = any, R = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
		return new Promise((resolve, reject) => {
			this.Instance.put<D, AxiosResponse<R>>(url, data, config)
				.then((response) => resolve(response.data))
				.catch((error: AxiosError) => reject(error.response?.data))
		})
	}

	// Delete
	public delete<D = any, R = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R> {
		return new Promise((resolve, reject) => {
			this.Instance.delete<D, AxiosResponse<R>>(url, config)
				.then((response) => resolve(response.data))
				.catch((error: AxiosError) => reject(error.response?.data))
		})
	}

	public postFormData<D = any, R = any>(url: string, data: D, config?: AxiosRequestConfig<D>): Promise<R> {
		return new Promise((resolve, reject) => {
			this.Instance.post<D, AxiosResponse<R>>(url, data, config)
				.then((response) => resolve(response.data))
				.catch((error: AxiosError) => reject(error.response?.data))
		})
	}
}

const configAuthService: AxiosRequestConfig = {
	baseURL: 'http://103.178.231.211:9301/',
	headers: {
		'Content-Type': 'application/json',
		TimeZone: DateTime.TimeZone()
	},
	timeout: 10 * 60 * 1000
}

const configCoreService: AxiosRequestConfig = {
	baseURL: 'http://103.178.231.211:9302/',
	headers: {
		'Content-Type': 'application/json',
		TimeZone: DateTime.TimeZone()
	},
	timeout: 10 * 60 * 1000
}

const configCDNService: AxiosRequestConfig = {
	baseURL: 'http://103.178.231.211:9303/',
	headers: {
		'Content-Type': 'multipart/form-data',
		TimeZone: DateTime.TimeZone(),
	},
	timeout: 10 * 60 * 1000
}

const HttpAuth = new Axios(configAuthService)
const HttpServices = new Axios(configCoreService)
const HttpCDN = new Axios(configCDNService)

export {
	HttpAuth,
	HttpServices,
	HttpCDN,
}
