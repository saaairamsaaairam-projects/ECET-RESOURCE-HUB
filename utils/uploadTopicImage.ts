import { supabase } from "./supabase";

export async function uploadTopicImage(file: File, topicId: string) {
  const filePath = `topics/${topicId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("topic-images")
    .upload(filePath, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("topic-images")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}
