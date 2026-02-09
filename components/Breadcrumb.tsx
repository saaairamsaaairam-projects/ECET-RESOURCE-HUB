"use client";

import Link from "next/link";

interface Folder {
  id: string;
  name: string;
}

export default function Breadcrumb({ path }: { path: Folder[] }) {
  return (
    <div className="text-sm text-gray-600 mb-4 flex items-center flex-wrap">

      <Link href="/" className="text-blue-600 hover:underline">
        Dashboard
      </Link>

      {path.map((folder, index) => (
        <span key={folder.id} className="flex items-center">
          
          <span className="mx-2 text-gray-500">/</span>

          <Link
            href={`/folder/${folder.id}`}
            className={`hover:underline ${
              index === path.length - 1 ? "font-semibold text-black" : "text-blue-600"
            }`}
          >
            {folder.name}
          </Link>

        </span>
      ))}

    </div>
  );
}
