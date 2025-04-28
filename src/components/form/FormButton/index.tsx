import { Button } from '@/components/ui/button';
import {useFormContext} from '@/hooks/use-app-form.ts';

interface FormButtonProps {
	label: string;
	disabled?: boolean;
	loading?: boolean;
}

const FormButton = (props: FormButtonProps) => {
	const {
		label,
		disabled,
		loading
	} = props;
	const form = useFormContext();

	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => <Button type={'submit'} disabled={isSubmitting || disabled || loading}>{label}</Button>}
		</form.Subscribe>
	);
};
export default FormButton;
