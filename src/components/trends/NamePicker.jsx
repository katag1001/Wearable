// Pick any number of names from a list: the chosen ones as removable
// chips, then a dropdown to add another. None chosen means "any".
const NamePicker = ({ label, options, value, onChange }) => (
  <div className="trends-picker">
    <span className="trends-picker-label">{label}</span>

    {value.map((name) => (
      <button
        key={name}
        type="button"
        className="trends-chip"
        onClick={() => onChange(value.filter((chosen) => chosen !== name))}
        aria-label={`Remove ${name}`}
      >
        {name} ×
      </button>
    ))}

    <select
      className="trends-select"
      value=""
      onChange={(event) => event.target.value && onChange([...value, event.target.value])}
    >
      <option value="">{value.length ? "or…" : "Any"}</option>
      {options
        .filter((option) => !value.includes(option))
        .map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
    </select>
  </div>
);

export default NamePicker;
