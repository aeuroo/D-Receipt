import { ChevronDown } from "./ChevronDown";

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;

export function SelectField({
  children,
  className = "",
  ...props
}: Props) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`field-input appearance-none pr-10 ${className}`}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}
