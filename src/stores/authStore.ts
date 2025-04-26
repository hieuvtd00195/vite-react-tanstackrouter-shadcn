import {create} from 'zustand';
import SessionStorage from '@/utils/SessionStorage.ts';

export const ACCESS_TOKEN = 'accessToken';
export const REFRESH_TOKEN = 'refreshToken';

interface AuthUser {
	accountNo: string;
	email: string;
	role: string[];
	exp: number;
}

interface AuthState {
	auth: {
		user: any | null
		setUser: (user: any | null) => void
		accessToken: string
		refreshToken: string
		setAccessToken: (accessToken: string) => void
		setRefreshToken: (refreshToken: string) => void
		resetAccessToken: () => void
		resetRefreshToken: () => void
		reset: () => void
		setToken: (accessToken: string, refreshToken: string) => void
	};
}

export const useAuthStore = create<AuthState>()((set) => {
	const token = SessionStorage.get(ACCESS_TOKEN);
	const initToken = token || '';
	const refreshToken = SessionStorage.get(REFRESH_TOKEN);
	const initRefreshToken = refreshToken || '';

	return {
		auth: {
			user: null,
			setUser: (user) =>
				set((state) => (
					{
						...state,
						auth: {
							...state.auth,
							user
						}
					}
				)),
			accessToken: initToken,
			refreshToken: initRefreshToken,
			setAccessToken: (accessToken) =>
				set((state) => {
					SessionStorage.set(ACCESS_TOKEN, accessToken);
					return {
						...state,
						auth: {
							...state.auth,
							accessToken
						}
					};
				}),
			setRefreshToken: (refreshToken) =>
				set((state) => {
					SessionStorage.set(REFRESH_TOKEN, refreshToken);
					return {
						...state,
						auth: {
							...state.auth,
							refreshToken
						}
					};
				}),
			resetAccessToken: () =>
				set((state) => {
					SessionStorage.remove(ACCESS_TOKEN);
					return {
						...state,
						auth: {
							...state.auth,
							accessToken: ''
						}
					};
				}),
			resetRefreshToken: () =>
				set((state) => {
					SessionStorage.remove(REFRESH_TOKEN);
					return {
						...state,
						auth: {
							...state.auth,
							refreshToken: ''
						}
					};
				}),
			reset: () =>
				set((state) => {
					SessionStorage.remove(ACCESS_TOKEN);
					SessionStorage.remove(REFRESH_TOKEN);
					return {
						...state,
						auth: {
							...state.auth,
							user: null,
							accessToken: '',
							refreshToken: ''
						},
					};
				}),
			setToken: (accessToken, refreshToken) =>
				set((state) => {
					SessionStorage.set(ACCESS_TOKEN, accessToken);
					SessionStorage.set(REFRESH_TOKEN, refreshToken);
					return {
						...state,
						auth: {
							...state.auth,
							accessToken,
							refreshToken
						}
					};
				}),
		},
	};
});

// export const useAuth = () => useAuthStore((state) => state.auth)
