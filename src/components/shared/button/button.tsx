export default function Button({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  ...buttonProps
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md text-white bg-flame hover:bg-red-600 transition ${className} disabled:opacity-50 disabled:text-midnight disabled:cursor-not-allowed`}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
