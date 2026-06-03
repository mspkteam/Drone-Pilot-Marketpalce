import type { JobDto } from "@/types/job";

export type AdminJobDto = JobDto & {
  client: {
    contactName: string;
    companyName: string | null;
    email: string | null;
  };
};
