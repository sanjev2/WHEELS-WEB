import { publicApi } from "@/app/lib/api/public";

export const publicActions = {
  categories: () => publicApi.categories(),
  packages: (category?: string) => publicApi.packages(category),
};