import { NextResponse } from 'next/server';
import pb from '@/lib/pocketbase';
import { recommendTopics } from '@/lib/topicRecommender';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const records = await pb.collection('exploration_results').getList(1, 50, {
      filter: `user_id = "${userId}"`,
      sort: '-created',
    });

    return NextResponse.json(records.items);
  } catch (error: any) {
    console.error('Failed to fetch history:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, subject, interests, careerHint, targetGoal, grade, count } = body;

    if (!userId || !subject) {
      return NextResponse.json({ error: 'User ID and Subject are required' }, { status: 400 });
    }

    // Generate topics
    const interestsList = interests ? interests.split(',').map((i: string) => i.trim()) : [];
    const topics = recommendTopics(subject, interestsList, careerHint, targetGoal || '', grade || 'high', count || 5);

    // Save each topic to history (optional: save all as one session or separate)
    // Here we save them as separate entries for easier history viewing
    const savedRecords = [];
    for (const topic of topics) {
      const record = await pb.collection('exploration_results').create({
        user_id: userId,
        subject,
        topic_title: topic.title,
        topic_direction: topic.direction,
        books: topic.books,
        papers: topic.papers,
        data_sources: topic.data_sources,
        expected_conclusion: topic.conclusion_seed,
        setuk_sentence: '', // Initially empty, can be generated later
        is_edited: false
      });
      savedRecords.push(record);
    }

    return NextResponse.json({ topics: savedRecords });
  } catch (error: any) {
    console.error('Failed to generate topics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
