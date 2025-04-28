import {z} from 'zod';
import useAppForm from '@/hooks/use-app-form.ts';
import FormInput from '@/components/form/FormInput';
import {Button} from '@/components/ui/button.tsx';

interface TestProps {

}

const testSchema = z.object({
	data: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			email: z.string()
				.email(),
			phone: z.string()
				.min(10)
				.max(10),
			address: z.string(),
			age: z.string(),
			card: z.string(),
			ccid: z.string(),
			uuid: z.string(),
			ppid: z.string(),
		})
	)
})

const Test = (props: TestProps) => {
	const form = useAppForm({
		defaultValues: {
			data: TestData
		},
		validators: {
			onChange: testSchema
		},
		onSubmit: (values) => {
			console.log(values);
		},
	})

	return (
		<form
			onSubmit={e => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className={'flex justify-center flex-col gap-2'}
		>
			<table>
				<thead>
					<tr>
						{Array.from({length: 10}).map((_, i) => (
							<th key={`header-${i}`}>
								{`Header ${i}`}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					<form.Field name={'data'} mode={'array'}>
						{(field) =>
							field.state.value.map((item, i) => (
								<tr key={item.id}>
									{Object.keys(item).map((key, j) => (
										<td key={`${item.id}.${key}.${j}`}>
											<FormInput form={form} name={`data[${i}].${key}`} label={key}/>
										</td>
									))}
								</tr>
							))
						}
					</form.Field>
				</tbody>
			</table>
			<Button type={'submit'}>Submit</Button>
		</form>
	);
};
export default Test;

const TestData = Array.from({length: 20}).map((_, i) => ({
	id: `${i}`,
	name: `name${i}`,
	email: 'email@gmail.com',
	phone: '1234567890',
	address: 'address',
	age: '20',
	card: '123456789',
	ccid: '123456789',
	uuid: '2',
	ppid: '3',
}))
