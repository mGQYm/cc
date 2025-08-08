import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// POST /api/routes/[id]/share - Create a share token
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Generate a unique share token
    const shareToken = Math.random().toString(36).substring(2, 10);

    const { data, error } = await supabase
      .from('routes')
      .update({
        is_public: true,
        share_token: shareToken,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select('share_token')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      share_token: data.share_token,
      share_url: `${process.env.NEXT_PUBLIC_BASE_URL}/share/${data.share_token}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/routes/[id]/share - Remove share token
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('routes')
      .update({
        is_public: false,
        share_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Share disabled successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}