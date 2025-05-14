
'use client';

import { useEffect, useState } from 'react';
import { getStories, TaskStory } from '@/lib/taskStories';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TaskLogPage() {
    const [stories, setStories] = useState<TaskStory[]>([]);

    useEffect(() => {
        const logs = getStories();
        setStories(logs.reverse());
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold text-center">📜 Task Completion Log</h1>

            {stories.length === 0 ? (
                <p className="text-center text-gray-500">No task stories yet.</p>
            ) : (
                <ul className="space-y-4">
                    {stories.map((story, idx) => (
                        <li key={idx} className="border border-gray-300 rounded-lg p-4 shadow-sm">
                            <div className="text-sm text-gray-500">{new Date(story.createdAt).toLocaleString()}</div>
                            <div className="text-lg font-medium text-blue-600">
                                Duration: {story.formatted}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex justify-center mt-6">
                <Link href="/">
                    <Button variant="default">⬅ Back to Home</Button>
                </Link>
            </div>
        </div>
    );
}
