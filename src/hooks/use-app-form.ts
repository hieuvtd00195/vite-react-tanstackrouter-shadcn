import {
	createFormHook,
	createFormHookContexts,

} from '@tanstack/react-form';
import {
	lazy,
} from 'react';
import FormButton from '@/components/form/FormButton';

const FormInput = lazy(() => import('@/components/form/FormInput'));

export const {
	fieldContext,
	formContext,
	useFieldContext,
	useFormContext
} = createFormHookContexts();

const {useAppForm} = createFormHook({
	fieldComponents: {
		FormInput
	},
	formComponents: {
		FormButton
	},
	fieldContext,
	formContext,
});
export default useAppForm;
