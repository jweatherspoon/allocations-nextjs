export default function Button({
  children,
  onClick,
  className = '',
  disabled = false,
  ...buttonProps
}: {
  children: React.ReactNode;
  onClick: () => void;
  // className?: string;
  disabled?: boolean;
  [key: string]: unknown;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md text-white bg-flame hover:bg-red-600 transition ${className} disabled:opacity-50 disabled:text-midnight disabled:cursor-not-allowed`}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
