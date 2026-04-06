-- Staff photos ship in the web app under public/staff/*.png (Vite serves them at /staff/...).
UPDATE public.staff_cv SET photo_url = '/staff/eman-karam.png' WHERE display_name = 'Dr. Eman Karam';
UPDATE public.staff_cv SET photo_url = '/staff/khaled-abdelslame.png' WHERE display_name = 'Dr. Khaled Abdelslame';
UPDATE public.staff_cv SET photo_url = '/staff/alaa-zaghloul.png' WHERE display_name = 'Dr. Alaa Zaghloul';
