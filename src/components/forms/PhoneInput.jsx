import { useState } from 'react'
import {
  NEPAL_PHONE_ERROR,
  NEPAL_PHONE_PATTERN,
  isValidNepalPhone,
  nepalPhoneNationalDigits,
  toNepalPhoneValue,
} from '../../utils/phone'

export default function PhoneInput({ value = '', onChange, label = 'Phone number', required = false }) {
  const [touched, setTouched] = useState(false)
  const invalid = touched && value && !isValidNepalPhone(value)

  return (
    <label>
      {label}{required ? ' *' : ''}
      <span className={`nepal-phone-control ${invalid ? 'invalid' : ''}`}>
        <span aria-hidden="true">+977</span>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={nepalPhoneNationalDigits(value)}
          onChange={(event) => onChange(toNepalPhoneValue(event.target.value))}
          onBlur={() => setTouched(true)}
          pattern={NEPAL_PHONE_PATTERN}
          title={NEPAL_PHONE_ERROR}
          placeholder="98XXXXXXXX"
          required={required}
          aria-invalid={Boolean(invalid)}
        />
      </span>
      <small className={invalid ? 'phone-hint phone-hint-error' : 'phone-hint'}>
        {invalid ? NEPAL_PHONE_ERROR : '10 digits · starts with 97, 98, or 01'}
      </small>
    </label>
  )
}
