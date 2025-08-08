import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/share/[token] - Get a shared route
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('share_token', params.token)
      .eq('is_public', true)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Route not found or not shared' },
        { status: 404 }
      );
    }

    return NextResponse.json({ route: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}