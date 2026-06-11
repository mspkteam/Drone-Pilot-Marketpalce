"use client";

import type { ConfigEmailTemplate } from "@/types/admin-configuration";

type AdminConfigEmailTemplateModalProps = {
  template: ConfigEmailTemplate;
  onClose: () => void;
};

export function AdminConfigEmailTemplateModal({
  template,
  onClose,
}: AdminConfigEmailTemplateModalProps) {
  return (
    <div
      className="admin-config-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="admin-config-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-config-email-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-config-modal-head">
          <h2 id="admin-config-email-title" className="admin-config-modal-title">
            {template.name}
          </h2>
          <p className="admin-config-modal-sub">
            {template.integrated
              ? "Template preview — editing persistence is pending."
              : "Planned workflow — template not wired to notifications yet."}
          </p>
        </div>
        <div className="admin-config-modal-body">
          <div className="admin-config-field">
            <label htmlFor="tpl-subject">Subject</label>
            <input id="tpl-subject" value={template.subject} readOnly />
          </div>
          <div className="admin-config-field">
            <label htmlFor="tpl-preheader">Preheader</label>
            <input id="tpl-preheader" value={template.preheader} readOnly />
          </div>
          <div className="admin-config-field">
            <label htmlFor="tpl-body">Body</label>
            <textarea id="tpl-body" rows={6} value={template.body} readOnly />
          </div>
          <div className="admin-config-field">
            <label>Variables</label>
            <p className="admin-config-variables">
              {template.variables.join(" · ")}
            </p>
          </div>
        </div>
        <div className="admin-config-modal-foot">
          <button type="button" className="admin-config-btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
