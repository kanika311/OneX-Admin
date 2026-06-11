type ReplyEmailInput = {
  email: string;
  name: string;
  message: string;
};

export function buildReplyEmailContent({ email, name, message }: ReplyEmailInput) {
  const to = email.trim();
  const subject = "Re: Your message to 1X";
  const body = [
    `Hi ${name.trim() || "there"},`,
    "",
    "Thank you for contacting 1X · Dr. Ayxh.",
    "",
    "---",
    "Your message:",
    message.trim(),
    "---",
    "",
  ].join("\n");

  return { to, subject, body };
}

/** Opens Gmail compose in a new tab — reliable in browser-based admin. */
export function openGmailReply(input: ReplyEmailInput) {
  const { to, subject, body } = buildReplyEmailContent(input);
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Opens the system default mail client. */
export function openMailtoReply(input: ReplyEmailInput) {
  const { to, subject, body } = buildReplyEmailContent(input);
  const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.assign(url);
}
