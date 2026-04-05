import { NextResponse } from "next/server";

export async function GET(request) {
    // Mocking analytics data
    const analytics = {
        strongTopics: [
            { topicId: "top-1", topicName: "Backend Basics", totalAttempted: 25, accuracy: 92 },
            { topicId: "top-2", topicName: "Web Frameworks", totalAttempted: 18, accuracy: 88 }
        ],
        weakTopics: [
            { topicId: "top-3", topicName: "Frontend Tech", totalAttempted: 12, accuracy: 45 },
            { topicId: "top-4", topicName: "ORM & DB", totalAttempted: 15, accuracy: 52 }
        ]
    };

    return NextResponse.json(analytics);
}
