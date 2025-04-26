import SessionStorage from '@/utils/SessionStorage'
import type {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse
} from 'axios'
import axios from 'axios'
import DateTime from '@/utils/DateTime.ts';
import {ACCESS_TOKEN} from '@/stores/authStore.ts';

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

		this.instance = instance
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
