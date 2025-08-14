import { NextRequest, NextResponse } from 'next/next';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/routes - Get all routes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const location = searchParams.get('location');
    const isPublic = searchParams.get('is_public');

    let query = supabase.from('routes').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (isPublic === 'true') {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ routes: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/routes - Create a new route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, location, days, total_days, interests, budget_level, user_id } = body;

    if (!title || !location || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('routes')
      .insert({
        title,
        description,
        location,
        days: JSON.stringify(days),
        total_days,
        interests: JSON.stringify(interests),
        budget_level,
        user_id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ route: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}