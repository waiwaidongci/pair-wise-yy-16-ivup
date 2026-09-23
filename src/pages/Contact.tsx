import { useState, type ChangeEvent, type FocusEvent } from 'react'

interface FormValues {
  name: string
  email: string
  message: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>
type Touched = Record<keyof FormValues, boolean>

const INITIAL_VALUES: FormValues = { name: '', email: '', message: '' }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.name.trim()) errors.name = '请填写姓名'
  if (!values.email.trim()) errors.email = '请填写邮箱'
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = '请输入有效的邮箱地址'
  if (!values.message.trim()) errors.message = '请填写留言内容'
  return errors
}

export default function Contact() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  const [touched, setTouched] = useState<Touched>({ name: false, email: false, message: false })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle')

  const errors = validate(values)
  const isValid = Object.keys(errors).length === 0

  const handleChange = (field: keyof FormValues) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
  }

  const handleBlur = (field: keyof FormValues) => (_e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  const visibleError = (field: keyof FormValues): string | undefined =>
    touched[field] ? errors[field] : undefined

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true, message: true })
    if (!isValid) return
    setStatus('sending')
    // Front-end-only simulation: no backend exists for this site.
    await new Promise((resolve) => setTimeout(resolve, 900))
    setStatus('success')
  }

  const handleReset = () => {
    setValues(INITIAL_VALUES)
    setTouched({ name: false, email: false, message: false })
    setStatus('idle')
  }

  return (
    <section className="section container contact-page">
      <header className="page-head">
        <h1 className="page-title">联系</h1>
        <p className="page-lede">
          展映、出版、肖像预约，或只是想聊聊光线下走过的一头牛——都可以写信来。
        </p>
      </header>

      {status === 'success' ? (
        <div className="contact-success" role="status">
          <span className="contact-success__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="34" height="34">
              <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </span>
          <h2>谢谢你的来信</h2>
          <p>
            {values.name.trim()}，消息已经安全送达。我通常在下山有信号的几天内回复
            {values.email.trim() && <>（{values.email.trim()}）</>}。
          </p>
          <button type="button" className="btn btn--ghost" onClick={handleReset}>
            再写一封
          </button>
        </div>
      ) : (
        <form className="contact-form" noValidate onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="contact-name">姓名</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={handleChange('name')}
              onBlur={handleBlur('name')}
              aria-invalid={Boolean(visibleError('name'))}
              aria-describedby={visibleError('name') ? 'contact-name-error' : undefined}
            />
            {visibleError('name') && (
              <p className="field-error" id="contact-name-error">
                {visibleError('name')}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="contact-email">邮箱</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={values.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              aria-invalid={Boolean(visibleError('email'))}
              aria-describedby={visibleError('email') ? 'contact-email-error' : undefined}
            />
            {visibleError('email') && (
              <p className="field-error" id="contact-email-error">
                {visibleError('email')}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="contact-message">留言</label>
            <textarea
              id="contact-message"
              name="message"
              rows={6}
              value={values.message}
              onChange={handleChange('message')}
              onBlur={handleBlur('message')}
              aria-invalid={Boolean(visibleError('message'))}
              aria-describedby={visibleError('message') ? 'contact-message-error' : undefined}
            />
            {visibleError('message') && (
              <p className="field-error" id="contact-message-error">
                {visibleError('message')}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn--solid"
            disabled={!isValid || status === 'sending'}
          >
            {status === 'sending' ? '正在送出…' : '发送消息'}
          </button>
        </form>
      )}
    </section>
  )
}
