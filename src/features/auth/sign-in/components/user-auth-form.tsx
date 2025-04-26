import {
	HTMLAttributes,
	useState
} from 'react';
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
	Link,
	useRouter
} from '@tanstack/react-router';
import {
	IconBrandFacebook,
	IconBrandGithub
} from '@tabler/icons-react';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {PasswordInput} from '@/components/password-input';
import axios from 'axios';
import {
	useMutation,
} from '@tanstack/react-query';
import {useAuthStore} from '@/stores/authStore.ts';
import { Route as AuthenticatedIndexRoute } from '@/routes/_authenticated/index';

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

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


export function UserAuthForm({
	className,
	...props
}: UserAuthFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [, setError] = useState<string | null>(null);
	const router = useRouter();

	const http = axios.create({
		baseURL: 'http://103.178.231.211:9301/',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		timeout: 10 * 60 * 1000,
	});

	const test = useMutation({
		mutationFn: (data: any) => http.post('auth/login', data),
		mutationKey: ['login'],
	});

	// const {} = useQuery({
	// 	queryKey: ['login'],
	// 	queryFn: (data: any) => http.post('auth/login', {
	// 	username: 'trungdq',
	// 		password: 'q',
	// 		otpCode: '111111'
	// }),
	// 	enabled: true
	// })

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		setIsLoading(true);
		setError(null);
		// Fake account
		// if (
		//   data.email === 'test@example.com' &&
		//   data.password === '1234567'
		// ) {
		//   signIn(data.email)
		//   router.navigate({ to: AuthenticatedIndexRoute.fullPath })
		// } else {
		//   setError('Email hoặc mật khẩu không đúng.\nDemo: test@example.com / 1234567')
		//   setIsLoading(false)
		//   router.navigate({ to: AuthIndex.fullPath })
		// }
		test.mutate({
			username: data.email,
			password: data.password,
			otpCode: '111111'
		}, {
			onSuccess: (res) => {
				const {accessToken, refreshToken} = res.data.responseData;
				useAuthStore.getState().auth.setToken(accessToken, refreshToken)
				router.navigate({to: AuthenticatedIndexRoute.fullPath})
			},
			onError: (error) => {
				console.log(error);
			}
		});
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={cn('grid gap-3', className)}
				{...props}
			>
				<FormField
					control={form.control}
					name="email"
					render={({field}) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="name@example.com" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({field}) => (
						<FormItem className="relative">
							<FormLabel>Password</FormLabel>
							<FormControl>
								<PasswordInput placeholder="********" {...field} />
							</FormControl>
							<FormMessage />
							<Link
								to="/forgot-password"
								className="text-muted-foreground absolute -top-0.5 right-0 text-sm font-medium hover:opacity-75"
							>
								Forgot password?
							</Link>
						</FormItem>
					)}
				/>
				<Button className="mt-2"
				        disabled={isLoading}>
					Login
				</Button>

				<div className="relative my-2">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">
              Or continue with
            </span>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-2">
					<Button variant="outline"
					        type="button"
					        disabled={isLoading}>
						<IconBrandGithub className="h-4 w-4" /> GitHub
					</Button>
					<Button variant="outline"
					        type="button"
					        disabled={isLoading}>
						<IconBrandFacebook className="h-4 w-4" /> Facebook
					</Button>
				</div>
			</form>
		</Form>
	);
}
