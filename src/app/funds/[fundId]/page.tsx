import { notFound } from 'next/navigation';

import { getFundDetails } from '@/api/funds/funds.api';
import FundDetailsPageContent from '@/components/funds/details/fund-details-page-content';

export default async function FundDetailsPage({
  params,
}: {
  params: Promise<{ fundId: string }>;
}) {
  const { fundId } = await params;
  const fundDetails = await getFundDetails([fundId]).then(
    (funds) => funds?.[0]
  );

  if (!fundDetails) {
    notFound();
  }

  return <FundDetailsPageContent fundDetails={fundDetails} />;
}
