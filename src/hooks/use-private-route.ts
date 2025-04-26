import {useAuthStore} from '@/stores/authStore.ts';
import {useQuery} from '@tanstack/react-query';
import {HttpAuth} from '@/services/HttpClient.ts';
import {
	useEffect,
} from 'react';
import {Route as AuthIndex} from '@/routes/(auth)/sign-in.tsx';
import {useRouter} from '@tanstack/react-router';

const usePrivateRoute = () => {
	const router = useRouter();

	if(!useAuthStore.getState().auth.accessToken) router.navigate({ to: AuthIndex.fullPath });

	const {data, isLoading} = useQuery({
		enabled: !!useAuthStore.getState().auth.accessToken,
		queryFn: async () => HttpAuth.get('api/v1/user/profile'),
		queryKey: ['userProfile'],
	})

	useEffect(() => {
		if(data){
			useAuthStore.getState().auth.setUser(data.responseData)
		}
	},[data])

	return {
		isInit: isLoading,
		hasUser: !!data?.responseData,
	}
}
export default usePrivateRoute;
