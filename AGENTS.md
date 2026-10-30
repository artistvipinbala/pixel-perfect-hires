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
- Public application form no longer uploads or saves; it validates in the browser and opens a prefilled WhatsApp chat to the office (src/lib/apply-whatsapp.ts) where the applicant attaches the CV — keeps CVs off the server. submitApplication server fn remains but is unused.
- Admin access is checked via `public.has_role` (user_roles table) in every admin server function and in RLS/storage policies; public signup is disabled — never derive admin from login alone.
- Validation rules live in `src/lib/application-rules.ts`, shared by browser and server, with tests next to it.
- Application deletion uses an authenticated server function and user-scoped RLS, checking admin access before removing the private CV and then its application; failures remain retryable.
- Applicant WhatsApp drafts use a browser-safe link helper shared by list and detail views; click-to-chat requires no messaging credentials and never sends automatically.
