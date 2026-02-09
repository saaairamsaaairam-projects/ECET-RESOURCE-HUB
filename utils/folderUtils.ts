import { supabase } from "./supabase";

export async function getFolderPath(folderId: string) {
  let path: any[] = [];
  let currentId = folderId;

  while (currentId) {
    const { data } = await supabase
      .from("folders")
      .select("*")
      .eq("id", currentId)
      .single();

    if (data) {
      path.push(data);
      currentId = data.parent_id;
    } else {
      break;
    }
  }

  return path.reverse();
}
