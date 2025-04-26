import {z} from 'zod';
import {useState} from 'react';
import {
	useRouter,
	useRouterState
} from '@tanstack/react-router';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Route as SignInRoute} from '@/routes/(auth)/sign-in.tsx';
import {useAuthStore} from '@/stores/authStore.ts';
import {Route as AuthenticatedIndexRoute} from '@/routes/_authenticated';
import {useLogin} from '@/features/auth/otp/services/otpService.ts';

const formSchema = z.object({
	otp: z.string().min(1, { message: 'Please enter your otp code.' }),
})

export const useOtp = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const login = useLogin()
	const router = useRouter()
	const {location} = useRouterState()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { otp: '' },
	})
	const otp = form.watch('otp')

	const onSubmit = (data: z.infer<typeof formSchema>) => {
		if(!location.state.login){
			router.navigate({to: SignInRoute.fullPath})
			return
		}
		const {email, password} = location.state.login

		setLoading(true)
		login.mutate({
			username: email,
			password: password,
			otpCode: data.otp,
		}, {
			onSuccess: (res) => {
				const {accessToken, refreshToken} = res.responseData;
				useAuthStore.getState().auth.setToken(accessToken, refreshToken)
				router.navigate({to: AuthenticatedIndexRoute.fullPath})
			},
			onSettled: () => {
				setLoading(false)
			}
		})
	}

	return {
		form,
		loading,
		onSubmit,
		validOtpLength: otp.length === 6,
	}
}
