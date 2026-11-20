import { FundScreen } from '@/components/fund/fund-screen';

export default async function FundPage({
  params,
}: {
  params: Promise<{ fundId: string }>;
}) {
  const { fundId } = await params;
  return <FundScreen fundId={fundId} />;
}
