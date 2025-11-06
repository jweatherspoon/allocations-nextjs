export default function AllocationDetailsCard({
  fundName,
  amount,
  notes,
}: {
  fundName: string;
  amount: string;
  notes?: string;
}) {
  return (
    <div className='border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow'>
      <div className='flex justify-between items-start'>
        <div>
          <p className='text-lg text-midnight'>{fundName}</p>
        </div>
        <p className='text-lg font-bold text-dusk'>{amount}</p>
      </div>
      {notes && <p className='text-sm text-dusk mt-2'>{notes}</p>}
    </div>
  );
}
