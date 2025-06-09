import { supabase } from '../app/supabaseClient';

export async function uploadImage(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('images') // Replace 'images' with your bucket name
    .upload(filePath, file);

  if (error) throw error;

  return filePath;
}