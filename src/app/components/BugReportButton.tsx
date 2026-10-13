"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Bug, X } from "lucide-react";
import { FormEvent, useRef, useState } from "react";

const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "";

export default function BugReportButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const openDialog = () => {
    setMessage("");
    setIsSuccess(false);
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
    setCaptchaToken(null);
    captchaRef.current?.resetCaptcha();
  };

  const submitReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!captchaToken || isSubmitting) return;

    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/bug-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          details,
          page: window.location.pathname,
          deviceInfo: {
            platform: navigator.platform,
            language: navigator.language,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            pixelRatio: window.devicePixelRatio,
          },
          captchaToken,
        }),
      });

      if (!response.ok) {
        setIsSuccess(false);
        setMessage("Your report couldn't be sent. Please try again later.");
        return;
      }

      setTitle("");
      setDetails("");
      setIsSuccess(true);
      setMessage("");
    } catch {
      setIsSuccess(false);
      setMessage("Your report couldn't be sent. Please check your connection and try again.");
    } finally {
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button className="bug-report-trigger" type="button" aria-haspopup="dialog" onClick={openDialog}>
        <span>Report a bug</span>
      </button>
      <dialog
        className="bug-report-dialog"
        ref={dialogRef}
        aria-labelledby="bug-report-title"
        onClose={() => {
          setCaptchaToken(null);
          captchaRef.current?.resetCaptcha();
        }}
      >
        <div className="bug-report-heading">
          <div>
            {!isSuccess && null}
            <h2 id="bug-report-title">{isSuccess ? "Your report has been sent!" : "Report a bug"}</h2>
          </div>
          <button
            className="bug-report-close"
            type="button"
            aria-label="Close bug report"
            onClick={closeDialog}
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        {!isSuccess && (
          <>
            <br />
            <form className="bug-report-form" onSubmit={submitReport}>
              <label className="bug-report-field">
                <span>Title</span>
                <input
                  autoFocus
                  required
                  maxLength={80}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Briefly describe the issue"
                />
              </label>
              <label className="bug-report-field">
                <span>What happened?</span>
                <textarea
                  required
                  minLength={10}
                  maxLength={2500}
                  rows={5}
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="Include steps to reproduce and what you expected to happen."
                />
              </label>
              <div className="bug-report-captcha">
                {siteKey ? (
                  <HCaptcha
                    ref={captchaRef}
                    sitekey={siteKey}
                    theme="dark"
                    onVerify={setCaptchaToken}
                    onExpire={() => setCaptchaToken(null)}
                    onError={() => setCaptchaToken(null)}
                  />
                ) : (
                  <p>Bug reports are temporarily unavailable.</p>
                )}
              </div>
              {message && (
                <p className="bug-report-result is-error" role="status">
                  {message}
                </p>
              )}
              <br />
              <div className="bug-report-actions">
                <button
                  className="bug-report-submit"
                  type="submit"
                  disabled={!siteKey || !captchaToken || isSubmitting}
                >
                  {isSubmitting ? "Sending…" : "Send report"}
                </button>
              </div>
            </form>
          </>
        )}
      </dialog>
    </>
  );
}
