"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import FolderCard from "@/components/FolderCard";
import FileCard from "../../../components/FileCard";
import Breadcrumb from "@/components/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { getFolderPath } from "@/utils/folderUtils";
import { useParams } from "next/navigation";

interface Folder {
  id: string;
  name: string;
  thumbnail?: string;
  parent_id?: string | null;
}

interface FolderPageParams {
  id: string;
}

interface FileType {
  id: string;
  file_name: string;
  file_url: string;
  folder_id: string;
}

export default function FolderPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [folder, setFolder] = useState<Folder | null>(null);
  const [subfolders, setSubfolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [path, setPath] = useState<Folder[]>([]);
  const { isAdmin, user } = useAuth();

  async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  useEffect(() => {
    if (!id) return;
    loadFolder(id);
    loadSubfolders(id);
    loadFiles(id);
    loadPath(id);
  }, [id]);

  async function loadFolder(folderId: string) {
    const { data } = await supabase
      .from("folders")
      .select("*")
      .eq("id", folderId)
      .single();

    setFolder(data);
  }

  async function loadSubfolders(folderId: string) {
    const { data } = await supabase
      .from("folders")
      .select("*")
      .eq("parent_id", folderId);

    setSubfolders(data || []);
  }

  async function loadFiles(folderId: string) {
    const { data } = await supabase
      .from("files")
      .select("*")
      .eq("folder_id", folderId);

    setFiles(data || []);
  }

  async function loadPath(folderId: string) {
    const p = await getFolderPath(folderId);
    setPath(p);
  }

  if (!folder) return <p className="p-6">Loading...</p>;

  return (
    <main className="min-h-screen bg-gray-100 p-6">

      <Breadcrumb path={path} />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{folder.name}</h1>

        <div className="flex gap-2">
          {user && (
            <span className="text-gray-700 text-sm">
              👤 {user.email}
            </span>
          )}

          {!isAdmin && !user && (
            <a
              href="/login"
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
            >
              Login
            </a>
          )}

          {isAdmin && (
            <a
              href={`/admin/rename-folder?id=${id}`}
              className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm"
            >
              Rename
            </a>
          )}

          {user && (
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="flex gap-2 mb-6">
          <a
            href={`/admin/create-folder?parent=${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg inline-block"
          >
            + Add Subfolder
          </a>
          <a
            href={`/admin/upload-file?folder=${id}`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg inline-block"
          >
            + Upload File
          </a>
        </div>
      )}

      {/* Subfolders Section */}
      <h2 className="text-xl font-bold mt-8 mb-4">Subfolders</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-8">
        {subfolders.length > 0 ? (
          subfolders.map(folder => (
            <FolderCard key={folder.id} folder={folder} />
          ))
        ) : (
          <p className="text-gray-500">No subfolders yet</p>
        )}
      </div>

      {/* Files Section */}
      <h2 className="text-xl font-bold mt-8 mb-4">Files</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {files.length > 0 ? (
          files.map(file => (
            <FileCard key={file.id} file={file} />
          ))
        ) : (
          <p className="text-gray-500">No files yet</p>
        )}
      </div>
    </main>
  );
}
