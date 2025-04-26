import {useMutation} from '@tanstack/react-query';
import {HttpAuth} from '@/services/HttpClient.ts';

interface ILoginData {
	username: string
	password: string
	otpCode: string
}

export const useLogin = () => useMutation({
	mutationFn: (data: ILoginData) => HttpAuth.post<ILoginData>('auth/login', data),
	mutationKey: ['login'],
});


