import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET all standalone topics (published for public, all for admin)
export async function GET(req: Request) {
  try {
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

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user ? await checkAdminStatus(supabase, user.id) : false;

    let query = supabase
      .from("standalone_topics")
      .select("*")
      .order("created_at", { ascending: false });

    // If not admin, only show published topics
    if (!isAdmin) {
      query = query.eq("published", true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("/api/standalone-topics GET error:", err);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}

// CREATE standalone topic
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
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

    // Check admin status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await checkAdminStatus(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const slug = slugify(title);

    const { data, error } = await supabase
      .from("standalone_topics")
      .insert([
        {
          title,
          slug,
          description,
          published: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    const errorMsg = (err as any)?.message || (err as any)?.toString?.() || "Unknown error";
    console.error("/api/standalone-topics POST error:", errorMsg, err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

// UPDATE standalone topic
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, description, published } = body;

    if (!id) {
      return NextResponse.json({ error: "Topic ID is required" }, { status: 400 });
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

    // Check admin status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await checkAdminStatus(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const updateData: any = {};
    if (title !== undefined) {
      updateData.title = title;
      updateData.slug = slugify(title);
    }
    if (description !== undefined) updateData.description = description;
    if (published !== undefined) updateData.published = published;

    const { data, error } = await supabase
      .from("standalone_topics")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error("/api/standalone-topics PUT error:", err);
    return NextResponse.json({ error: "Failed to update topic" }, { status: 500 });
  }
}

// DELETE standalone topic
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Topic ID is required" }, { status: 400 });
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

    // Check admin status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await checkAdminStatus(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { error } = await supabase
      .from("standalone_topics")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("/api/standalone-topics DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 });
  }
}

// Helper function to check admin status
async function checkAdminStatus(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .single();

    return data?.role === "admin";
  } catch {
    return false;
  }
}