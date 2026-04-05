import { NextResponse } from "next/server";

export async function GET(request) {
    // Mocking history data
    const history = [
        {
            id: "hist-1",
            subject: { name: "Full Stack Python" },
            topics: ["Topic 1", "Topic 2"],
            difficulty: "medium",
            scorePercentage: 90,
            correctAnswers: 9,
            totalQuestions: 10,
            createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: "hist-2",
            subject: { name: "Full Stack Python" },
            topics: ["Backend Basics"],
            difficulty: "hard",
            scorePercentage: 70,
            correctAnswers: 7,
            totalQuestions: 10,
            createdAt: new Date(Date.now() - 172800000).toISOString()
        }
    ];

    return NextResponse.json(history);
}
