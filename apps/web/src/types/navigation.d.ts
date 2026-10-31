// Explicit type augmentation for next/navigation to ensure Client Component hooks
// like usePathname are always resolved by TypeScript across all IDE and build contexts.

declare module "next/navigation" {
  export function usePathname(): string;
  export function useSearchParams(): import("next/dist/shared/lib/hooks-client-context.shared-runtime").ReadonlyURLSearchParams;
  export function useRouter(): import("next/dist/shared/lib/app-router-context.shared-runtime").AppRouterInstance;
  export function useParams<T = Record<string, string | string[]>>(): T;
  export function useSelectedLayoutSegments(parallelRouteKey?: string): string[];
  export function useSelectedLayoutSegment(parallelRouteKey?: string): string | null;
  export { redirect, permanentRedirect } from "next/dist/client/components/redirect";
  export { notFound } from "next/dist/client/components/not-found";
  export { forbidden } from "next/dist/client/components/forbidden";
  export { unauthorized } from "next/dist/client/components/unauthorized";
}
