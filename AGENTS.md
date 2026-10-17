<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Application submission goes through the `submitApplication` server function (service-role, validated server-side); applicants never get table or storage access — keeps CVs private.
- Admin access is checked via `public.has_role` (user_roles table) in every admin server function and in RLS/storage policies; public signup is disabled — never derive admin from login alone.
- Validation rules live in `src/lib/application-rules.ts`, shared by browser and server, with tests next to it.
- Application deletion uses an authenticated server function and user-scoped RLS, checking admin access before removing the private CV and then its application; failures remain retryable.
