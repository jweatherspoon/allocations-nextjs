import { FundStatus } from '../../lib/models/funds/fund.model';

export interface FundCardProps {
  id: string;
  name: string;
  description: string;
  currentAmount: number;
  targetAmount?: number;
  status: FundStatus;
}

export default function FundCard(props: FundCardProps) {
  const { name, description, targetAmount, currentAmount, status } = props;
  const progressPercentage = targetAmount ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 transition-shadow hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-2">{name}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3">{description}</p>

      {/* Progress section */}
      {targetAmount && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium text-gray-900">{progressPercentage.toFixed(1)}%</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Amount info */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">
              ${currentAmount.toLocaleString()} raised
            </span>
            <span className="text-gray-500">
              of ${targetAmount.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}