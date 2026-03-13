import './IconInput.css'

function IconInput({
  id,
  name,
  type,
  placeholder,
  iconPath,
  value,
  onChange,
  autoComplete,
  disabled = false,
}) {
  return (
    <div className="input-wrap">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d={iconPath} />
      </svg>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        disabled={disabled}
      />
    </div>
  )
}

export default IconInput
