"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MilestoneLockedModal } from "@/components/milestones/MilestoneLockedModal";
import {
  getActiveMilestone,
  getMilestoneDefinition,
} from "@/lib/milestone-access";
import type { MilestoneDefinition } from "@/lib/milestones";
import type { UserRole } from "@/types/roles";

type MilestoneModalState = {
  featureLabel: string;
  requiredMilestone: MilestoneDefinition;
};

type MilestoneAccessContextValue = {
  activeMilestone: number;
  userRole?: UserRole;
  milestonePreviewEnabled: boolean;
  openLockedModal: (featureLabel: string, requiredMilestone: number) => void;
  closeLockedModal: () => void;
};

const MilestoneAccessContext = createContext<MilestoneAccessContextValue | null>(
  null,
);

type MilestoneAccessProviderProps = {
  children: ReactNode;
  userRole?: UserRole;
  milestonePreviewEnabled?: boolean;
  activeMilestone?: number;
};

export function MilestoneAccessProvider({
  children,
  userRole,
  milestonePreviewEnabled = false,
  activeMilestone,
}: MilestoneAccessProviderProps) {
  const [modal, setModal] = useState<MilestoneModalState | null>(null);

  const openLockedModal = useCallback(
    (featureLabel: string, requiredMilestone: number) => {
      const definition = getMilestoneDefinition(requiredMilestone);
      if (!definition) return;
      setModal({ featureLabel, requiredMilestone: definition });
    },
    [],
  );

  const closeLockedModal = useCallback(() => setModal(null), []);

  const value = useMemo(
    () => ({
      activeMilestone: activeMilestone ?? getActiveMilestone(),
      userRole,
      milestonePreviewEnabled,
      openLockedModal,
      closeLockedModal,
    }),
    [
      activeMilestone,
      userRole,
      milestonePreviewEnabled,
      openLockedModal,
      closeLockedModal,
    ],
  );

  return (
    <MilestoneAccessContext.Provider value={value}>
      {children}
      {modal ? (
        <MilestoneLockedModal
          open
          featureLabel={modal.featureLabel}
          requiredMilestone={modal.requiredMilestone}
          onClose={closeLockedModal}
        />
      ) : null}
    </MilestoneAccessContext.Provider>
  );
}

export function useMilestoneAccess() {
  const context = useContext(MilestoneAccessContext);
  if (!context) {
    throw new Error("useMilestoneAccess must be used within MilestoneAccessProvider");
  }
  return context;
}

export function useOptionalMilestoneAccess() {
  return useContext(MilestoneAccessContext);
}
