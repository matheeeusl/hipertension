interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

export const FilterButtonGroup = <T extends string>({ options, selected, onSelect }: Props<T>) => (
  <div className="flex gap-2">
    {options.map((option) => (
      <button
        key={option.value}
        onClick={() => onSelect(option.value)}
        className={`px-3 py-1 text-xs rounded-md transition-colors ${
          selected === option.value
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);
