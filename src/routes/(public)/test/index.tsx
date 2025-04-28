import { createFileRoute } from '@tanstack/react-router'
import Test from '@/features/test/index.tsx'

export const Route = createFileRoute('/(public)/test/')({
  component: Test,
})
