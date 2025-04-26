import {useAuthStore} from '@/stores/authStore.ts';
import {useQuery} from '@tanstack/react-query';
import {HttpAuth} from '@/services/HttpClient.ts';
import {
	useEffect,
	useState,
} from 'react';
import {Route as AuthIndex} from '@/routes/(auth)/sign-in.tsx';
import {useRouter} from '@tanstack/react-router';

const usePrivateRoute = () => {
	const router = useRouter();
	const [isTokenReady, setIsTokenReady] = useState(false);
	const authState = useAuthStore.getState().auth;

	useEffect(() => {
		const checkAndRefreshToken = async () => {
			if (!authState.accessToken) {
				router.navigate({ to: AuthIndex.fullPath });
				return;
			}
			
			setIsTokenReady(true);
		};
		
		checkAndRefreshToken();
	}, [authState.accessToken, router]);

	const {data, isLoading} = useQuery({
		enabled: !!authState.accessToken && isTokenReady,
		queryFn: async () => HttpAuth.get('api/v1/user/profile'),
		queryKey: ['userProfile'],
		retry: 1, 
	});

	useEffect(() => {
		if(data){
			useAuthStore.getState().auth.setUser(data.responseData);
		}
	}, [data]);

	return {
		isInit: isLoading || !isTokenReady,
		hasUser: !!data?.responseData,
	}
}
export default usePrivateRoute;
