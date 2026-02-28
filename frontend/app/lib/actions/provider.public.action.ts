import { providersPublicApi } from "@/app/lib/api/provider.public"

export const providersPublicActions = {
  list: (category?: string) => providersPublicApi.list(category),
}