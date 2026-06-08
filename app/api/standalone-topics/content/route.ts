import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// GET topic content by topic ID
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");

    if (!topicId) {
      return NextResponse.json({ error: "topicId parameter is required" }, { status: 400 });
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

    // Check if user is admin or topic is published
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user ? await checkAdminStatus(supabase, user.id) : false;

    // Get topic to check published status
    const { data: topic, error: topicError } = await supabase
      .from("standalone_topics")
      .select("published")
      .eq("id", topicId)
      .single();

    if (topicError) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Allow access if admin or topic is published
    if (!isAdmin && !topic.published) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("standalone_topic_content")
      .select("content")
      .eq("topic_id", topicId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return NextResponse.json({ content: data?.content || "" });
  } catch (err) {
    console.error("/api/standalone-topics/content GET error:", err);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

// UPDATE topic content
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { topicId, content } = body;

    if (!topicId) {
      return NextResponse.json({ error: "topicId is required" }, { status: 400 });
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

    const { data, error } = await supabase
      .from("standalone_topic_content")
      .upsert(
        {
          topic_id: topicId,
          content: content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "topic_id" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("/api/standalone-topics/content PUT error:", err);
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
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