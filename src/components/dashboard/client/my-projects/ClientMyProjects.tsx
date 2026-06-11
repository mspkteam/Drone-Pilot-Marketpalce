"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CLIENT_MY_PROJECT_TABS,
  CLIENT_MY_PROJECTS,
  CLIENT_MY_PROJECTS_ROUTES,
  filterClientMyProjects,
  type ClientMyProjectTabId,
} from "@/lib/client/my-projects-mock";
import { ClientProjectCard } from "./ClientProjectCard";
import { PlusCircleIcon } from "./ClientMyProjectsIcons";

type ClientMyProjectsProps = {
  submittedBanner?: boolean;
};

export function ClientMyProjects({ submittedBanner }: ClientMyProjectsProps) {
  const [activeTab, setActiveTab] = useState<ClientMyProjectTabId>("all");

  const filteredProjects = useMemo(
    () => filterClientMyProjects(CLIENT_MY_PROJECTS, activeTab),
    [activeTab],
  );

  return (
    <div className="client-my-projects-page">
      <header className="client-my-projects-header">
        <div className="client-my-projects-header-copy">
          <h1 className="client-my-projects-title">My Projects</h1>
          <p className="client-my-projects-subtitle">
            Manage every project you&apos;ve posted on Remote Air Service.
          </p>
        </div>

        <Link
          href={CLIENT_MY_PROJECTS_ROUTES.newProject}
          className="client-my-projects-new-btn"
        >
          <PlusCircleIcon />
          New Project
        </Link>
      </header>

      {submittedBanner ? (
        <p
          className="client-my-projects-banner"
          role="status"
        >
          Project submitted for admin approval. Pilots will see it after approval
          (M07).
        </p>
      ) : null}

      <div className="client-my-projects-tabs-wrap">
        <div
          className="client-my-projects-tabs"
          role="tablist"
          aria-label="Filter projects by status"
        >
          {CLIENT_MY_PROJECT_TABS.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`client-my-projects-tab${selected ? " client-my-projects-tab--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="client-my-projects-tabs-divider" aria-hidden />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="client-my-projects-empty" role="status">
          <p className="client-my-projects-empty-title">No projects found</p>
          <p className="client-my-projects-empty-text">
            Projects matching this status will appear here.
          </p>
        </div>
      ) : (
        <div className="client-my-projects-grid">
          {filteredProjects.map((project) => (
            <ClientProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
