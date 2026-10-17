GRANT DELETE ON public.applications TO authenticated;
CREATE POLICY "Admins delete applications" ON public.applications FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete resumes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'::public.app_role));