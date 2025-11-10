'use client';

import DetailsSectionContainer from '@/components/shared/containers/sections/details-section-container';
import { TransactionDetails } from '@/models/funds/transaction.model';
import { formatCurrency, formatDate } from '@/utils/format.utils';

export default function TransactionDetailsModalContent({
  transactionDetails,
}: {
  transactionDetails: TransactionDetails;
}) {
  return (
    <div>
      <h2 className='text-lg font-semibold text-midnight mb-2'>
        Transaction Details
      </h2>
      <span className='w-full justify-end flex text-midnight font-semibold'>
        {formatDate(transactionDetails.modifiedAt)}
      </span>
      <hr className='border-t border-flame mb-4' />
      <div className='space-y-4'>
        <DetailsSectionContainer>
          <div className='flex justify-between items-center'>
            <h3 className='text-md text-midnight font-semibold capitalize'>
              {transactionDetails.type}
            </h3>
            <span className='text-md text-midnight'>
              {formatCurrency(transactionDetails.value)}
            </span>
          </div>
        </DetailsSectionContainer>
        {transactionDetails.notes && (
          <DetailsSectionContainer>
            <h3 className='text-md text-midnight font-semibold mb-2'>Notes:</h3>
            <p className='text-midnight'>{transactionDetails.notes}</p>
          </DetailsSectionContainer>
        )}
      </div>
    </div>
  );
}
