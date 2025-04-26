import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Route as OtpRoute} from '@/routes/(auth)/otp.tsx';
import {
	useRouter,
} from '@tanstack/react-router';

const formSchema = z.object({
	email: z
		.string(),
	// .min(1, {message: 'Please enter your email'})
	// .email({message: 'Invalid email address'}),
	password: z
		.string()
	// .min(1, {
	// 	message: 'Please enter your password',
	// })
	// .min(7, {
	// 	message: 'Password must be at least 7 characters long',
	// }),
});

export const useSignIn = () => {
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = (data: z.infer<typeof formSchema>) => {
		router.navigate({to: OtpRoute.fullPath, state: {login: {...data}}});
	}

	return {
		form,
		onSubmit
	};
}
