function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
    </div>
  );
}

export default Input;