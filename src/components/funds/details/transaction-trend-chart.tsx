import {
  CategoryScale,
  Chart,
  ChartData,
  ChartDataset,
  ChartOptions,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import { TransactionDetails } from '@/models/funds/transaction.model';
import { formatCurrency, formatDate } from '@/utils/format.utils';

Chart.register(
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Tooltip,
  Filler
);

export const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  devicePixelRatio: 2,
  plugins: {
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (context) => {
          const value = context.parsed.y;
          if (value === null) return '';
          return `Balance: $${value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        },
      },
    },
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: 'var(--color-midnight)',
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
      },
      ticks: {
        display: true,
        color: 'var(--color-midnight)',
        callback: (value) => {
          return `$${Number(value).toLocaleString('en-US', {
            notation: 'compact',
          })}`;
        },
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
};

export default function TransactionTrendChart({
  transactions,
}: {
  transactions: TransactionDetails[];
}) {
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort(
    (a, b) =>
      new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime()
  );

  // Calculate cumulative balance over time
  const balanceOverTime = sortedTransactions.reduce<number[]>((acc, tx) => {
    const previousBalance = acc.length > 0 ? acc[acc.length - 1] : 0;
    let newBalance = previousBalance;

    if (tx.status === 'completed') {
      if (tx.type === 'deposit' || tx.type === 'transfer') {
        newBalance = previousBalance + tx.value;
      } else if (tx.type === 'withdrawal') {
        newBalance = previousBalance - tx.value;
      }
    }

    return [...acc, newBalance];
  }, []);

  // Create labels from transaction dates
  const labels = sortedTransactions.map((tx) => formatDate(tx.modifiedAt));

  // Create options with access to transaction data
  const chartOptions: ChartOptions<'line'> = {
    ...options,
    plugins: {
      ...options.plugins,
      tooltip: {
        ...options.plugins?.tooltip,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            const tx = sortedTransactions[index];
            return formatDate(tx.modifiedAt);
          },
          label: (context) => {
            const index = context.dataIndex;
            const tx = sortedTransactions[index];
            const balance = context.parsed.y;

            if (balance === null) return '';

            const typeLabel =
              tx.type.charAt(0).toUpperCase() + tx.type.slice(1);
            const statusLabel =
              tx.status.charAt(0).toUpperCase() + tx.status.slice(1);

            return [
              `${typeLabel}: ${formatCurrency(tx.value)}`,
              `Status: ${statusLabel}`,
              `Balance: ${formatCurrency(balance)}`,
            ];
          },
          afterLabel: (context) => {
            const index = context.dataIndex;
            const tx = sortedTransactions[index];

            if (tx.notes) {
              return `Notes: ${tx.notes}`;
            }
            return '';
          },
        },
      },
    },
  };

  const dataset: ChartDataset<'line'> = {
    data: balanceOverTime,
    fill: false,
    backgroundColor: (context) => {
      const ctx = context.chart.ctx;
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      // Midnight color with opacity gradient
      gradient.addColorStop(0, 'oklch(0.95 0.0135 92.98 / 0.6)');
      gradient.addColorStop(1, 'oklch(0.9906 0.0135 92.98 / 0.1)');
      return gradient;
    },
    borderColor: 'var(--color-midnight)', // Midnight color
    borderWidth: 3,
    borderCapStyle: 'round',
    borderJoinStyle: 'round',
    tension: 0.4, // Bezier curve
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: (context) => {
      const index = context.dataIndex;
      const tx = sortedTransactions[index];

      if (tx.type === 'deposit') {
        return 'rgba(34, 197, 94, 1)'; // Green
      } else if (tx.type === 'withdrawal') {
        return 'rgba(239, 68, 68, 1)'; // Red
      } else if (tx.type === 'transfer') {
        return 'rgba(59, 130, 246, 1)'; // Blue
      }
      return 'rgba(59, 130, 246, 1)'; // Default blue
    },
    pointBorderColor: 'var(--color-flame)',
    pointBorderWidth: 1,
    pointHoverBackgroundColor: (context) => {
      const index = context.dataIndex;
      const tx = sortedTransactions[index];

      if (tx.type === 'deposit') {
        return 'rgba(34, 197, 94, 1)'; // Green
      } else if (tx.type === 'withdrawal') {
        return 'rgba(239, 68, 68, 1)'; // Red
      } else if (tx.type === 'transfer') {
        return 'rgba(59, 130, 246, 1)'; // Blue
      }
      return 'rgba(59, 130, 246, 1)'; // Default blue
    },
    pointHoverBorderColor: 'var(--color-flame)',
    pointHoverBorderWidth: 3,
  };

  const data: ChartData<'line'> = {
    labels,
    datasets: [dataset],
  };

  return <Line data={data} options={chartOptions} />;
}
