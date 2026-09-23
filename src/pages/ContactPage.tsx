import { useMemo, useState } from "react";

type Fields = "name" | "email" | "message";

interface Values {
  name: string;
  email: string;
  message: string;
}

type Errors = Partial<Record<Fields, string>>;

const EMPTY: Values = { name: "", email: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) {
    errors.name = "Please enter your name.";
  }
  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "That email address doesn’t look right — please check it.";
  }
  if (!values.message.trim()) {
    errors.message = "Please write a message before sending.";
  }
  return errors;
}

export default function ContactPage() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Record<Fields, boolean>>({
    name: false,
    email: false,
    message: false,
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Re-derive errors from the values on every render — single source,
  // no stale-error bookkeeping.
  const errors = useMemo(() => validate(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  const visibleError = (field: Fields): string | undefined =>
    touched[field] ? errors[field] : undefined;

  const handleChange = (field: Fields, raw: string) => {
    setValues((v) => ({ ...v, [field]: raw }));
  };

  const handleBlur = (field: Fields) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (!isValid || sending) return;

    // Front-end-only simulated send (no backend exists).
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSending(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="container">
        <div className="contact-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="contact-form form-success" role="status" aria-live="polite">
            <span className="success-mark" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12.5l5 5L20 6.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h2>Message sent</h2>
            <p>
              Thank you, {values.name.trim().split(/\s+/)[0] || "friend"}.
              Your note has reached the studio — replies usually arrive within
              a few days.
            </p>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setValues(EMPTY);
                setTouched({ name: false, email: false, message: false });
                setSent(false);
              }}
            >
              Send another message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="contact-grid">
        <div className="contact-intro">
          <p className="eyebrow">Contact</p>
          <h1>Get in touch</h1>
          <p>
            For prints, exhibitions, licensing or a portrait sitting — write a
            few lines and the studio will answer.
          </p>

          <div className="contact-channels">
            <div>
              <span className="channel-label">Email</span>
              <a className="channel-value" href="mailto:studio@dechenlhamo.photo">
                studio@dechenlhamo.photo
              </a>
            </div>
            <div>
              <span className="channel-label">Based in</span>
              <span className="channel-value">Xining · Tibetan Plateau</span>
            </div>
            <div>
              <span className="channel-label">Response time</span>
              <span className="channel-value">Within 3–5 days</span>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className={`field${visibleError("name") ? " has-error" : ""}`}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              aria-invalid={Boolean(visibleError("name"))}
              aria-describedby={visibleError("name") ? "name-error" : undefined}
            />
            {visibleError("name") && (
              <span className="field-error" id="name-error" role="alert">
                {visibleError("name")}
              </span>
            )}
          </div>

          <div className={`field${visibleError("email") ? " has-error" : ""}`}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              aria-invalid={Boolean(visibleError("email"))}
              aria-describedby={visibleError("email") ? "email-error" : undefined}
            />
            {visibleError("email") && (
              <span className="field-error" id="email-error" role="alert">
                {visibleError("email")}
              </span>
            )}
          </div>

          <div className={`field${visibleError("message") ? " has-error" : ""}`}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={values.message}
              onChange={(e) => handleChange("message", e.target.value)}
              onBlur={() => handleBlur("message")}
              aria-invalid={Boolean(visibleError("message"))}
              aria-describedby={
                visibleError("message") ? "message-error" : undefined
              }
            />
            {visibleError("message") && (
              <span className="field-error" id="message-error" role="alert">
                {visibleError("message")}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={!isValid || sending}
          >
            {sending ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Sending…
              </>
            ) : (
              "Send"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
