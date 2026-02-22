import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET topics for folder
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // ignore
            }
          },
        },
      }
    );

    const { data } = await supabase
      .from("practice_topics")
      .select("*")
      .eq("subject_folder_id", folderId)
      .order("order_index");

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("/api/topics GET error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// CREATE topic
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { folderId, title } = body;

    if (!folderId || !title) {
      return NextResponse.json({ error: "folderId and title are required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // ignore
            }
          },
        },
      }
    );

    const slug = slugify(title);

    const { data, error } = await supabase
      .from("practice_topics")
      .insert([
        {
          subject_folder_id: folderId,
          name: title,
          slug,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    const errorMsg = (err as any)?.message || (err as any)?.toString?.() || "Unknown error";
    console.error("/api/topics POST error:", errorMsg, err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

// UPDATE topic
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { topicId, title } = body;

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // ignore
            }
          },
        },
      }
    );

    const slug = slugify(title);

    const { data, error } = await supabase
      .from("practice_topics")
      .update({ name: title, slug })
      .eq("id", topicId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error("/api/topics PUT error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// DELETE topic
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { topicId } = body;

    if (!topicId) {
      return NextResponse.json({ error: "topicId required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // ignore
            }
          },
        },
      }
    );

    await supabase.from("practice_topics").delete().eq("id", topicId);
    // remove practice questions linked to topic
    await supabase.from("practice_questions").delete().eq("topic_id", topicId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("/api/topics DELETE error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
