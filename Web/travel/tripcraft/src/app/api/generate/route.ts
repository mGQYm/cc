import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { RouteGenerationRequest } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// POST /api/generate - Generate routes based on preferences
export async function POST(request: NextRequest) {
  try {
    const body: RouteGenerationRequest = await request.json();
    const { location, days, interests, budget_level } = body;

    if (!location || !days) {
      return NextResponse.json(
        { error: 'Location and days are required' },
        { status: 400 }
      );
    }

    // Get spots for the location
    let spotsQuery = supabase.from('spots').select('*').ilike('location', `%${location}%`);
    
    if (interests && interests.length > 0) {
      spotsQuery = spotsQuery.in('category', interests);
    }

    const { data: spots, error: spotsError } = await spotsQuery.order('rating', { ascending: false });

    if (spotsError) {
      return NextResponse.json({ error: spotsError.message }, { status: 500 });
    }

    if (!spots || spots.length === 0) {
      return NextResponse.json({ routes: [] });
    }

    // Generate 3 different route configurations
    const routes = generateRoutes(spots, location, days, interests || [], budget_level || 2);

    return NextResponse.json({ routes });
  } catch (error) {
    console.error('Error generating routes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateRoutes(spots: any[], location: string, days: number, interests: string[], budgetLevel: number) {
  const routes = [];
  const routeTemplates = [
    { title: `${location}经典${days}日游`, description: `精选${location}必游景点，体验经典之旅` },
    { title: `${location}深度${days}日游`, description: `深入探索${location}文化，发现隐藏宝藏` },
    { title: `${location}休闲${days}日游`, description: `轻松自在的${location}之旅，尽享慢生活` }
  ];

  for (let i = 0; i < 3; i++) {
    const routeSpots = [];
    const spotsPerDay = Math.ceil(spots.length / days);
    
    for (let day = 0; day < days; day++) {
      const daySpots = spots.slice(day * spotsPerDay, (day + 1) * spotsPerDay);
      const totalDuration = daySpots.reduce((sum, spot) => sum + (spot.duration || 120), 0);
      
      routeSpots.push({
        date: new Date(Date.now() + day * 86400000).toISOString().split('T')[0],
        spots: daySpots,
        total_duration: totalDuration
      });
    }

    routes.push({
      id: `route-${i + 1}-${Date.now()}`,
      title: routeTemplates[i].title,
      description: routeTemplates[i].description,
      location,
      days: routeSpots,
      total_days: days,
      interests,
      budget_level: budgetLevel,
      created_at: new Date().toISOString()
    });
  }

  return routes;
}