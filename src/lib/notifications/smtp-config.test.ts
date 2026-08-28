import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSmtpConfig } from "./smtp-config";

describe("smtp config", () => {
  it("builds config from SMTP_HOST fields", () => {
    const prev = {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_SECURE: process.env.SMTP_SECURE,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASSWORD: process.env.SMTP_PASSWORD,
      EMAIL_FROM: process.env.EMAIL_FROM,
      SMTP_URL: process.env.SMTP_URL,
    };

    process.env.SMTP_URL = "";
    process.env.SMTP_HOST = "smtp.hostinger.com";
    process.env.SMTP_PORT = "465";
    process.env.SMTP_SECURE = "true";
    process.env.SMTP_USER = "support@remoteairservice.com";
    process.env.SMTP_PASSWORD = "secret";
    process.env.EMAIL_FROM = "Remote Air Service <support@remoteairservice.com>";

    const config = getSmtpConfig();
    assert.ok(config);
    assert.equal(config?.host, "smtp.hostinger.com");
    assert.equal(config?.user, "support@remoteairservice.com");

    for (const [key, value] of Object.entries(prev)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
});
