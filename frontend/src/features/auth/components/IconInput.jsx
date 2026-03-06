import './IconInput.css'

function IconInput({ id, type, placeholder, iconPath }) {
  return (
    <div className="input-wrap">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d={iconPath} />
      </svg>
      <input id={id} type={type} placeholder={placeholder} />
    </div>
  )
}

export default IconInput
