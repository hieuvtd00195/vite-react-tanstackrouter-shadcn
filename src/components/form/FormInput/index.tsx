import {
	FormItem,
	TSFormError,
    TSFormLabel
} from '@/components/ui/form';
import {Input} from '@/components/ui/input.tsx';
import {
	ReactFormApi
} from '@tanstack/react-form';

interface FormInputProps {
	label?: string;
	placeholder?: string;
	name: string
	form: ReactFormApi<any, any, any, any, any, any, any, any, any, any>
}

const FormInput = (props: FormInputProps) => {
	const {
		placeholder,
		label,
		form,
		name
	} = props;

	return (
		<form.Field
			name={name}
			children={(field) => (
				<FormItem>
					{label && (
						<TSFormLabel
							name={field.name}
							error={!!field.state.meta.errors.length}
						>
							{label}
						</TSFormLabel>
					)}

					<Input
						placeholder={placeholder}
						value={field.state.value}
						onChange={(e) => field.handleChange(e.target.value)}
					/>
					<TSFormError
						name={field.name}
						errorMessage={field.state.meta?.errors?.[0]?.message}
					/>
				</FormItem>
			)}
		/>
	);
};
export default FormInput;
