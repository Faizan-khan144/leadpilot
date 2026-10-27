import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export const PasswordField = ({ id, registration, placeholder = '••••••••', ...props }) => {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className="input h-11 rounded-xl border-orange-100 bg-[#fffaf5] pr-10 text-[13px]"
        placeholder={placeholder}
        {...registration}
        {...props}
      />
      <button
        type="button"
        className="absolute right-1 top-1.5 grid h-8 w-8 place-items-center rounded-lg text-subtle transition hover:bg-orange-50 hover:text-orange-600"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
