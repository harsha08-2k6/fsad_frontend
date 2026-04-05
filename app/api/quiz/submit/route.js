import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();
    const { quizId, studentId, isTeacherQuiz, questions } = body;
    
    // Calculate Score
    let correctCount = 0;
    questions.forEach(q => {
        // q.options[selectedIdx] === q.correctAnswerText or compare indices
        // Let's assume indices for simplicity as we control both ends
        if (q.studentAnswer?.trim() === q.options[q.correctOptionIndex]?.trim()) {
            correctCount++;
        }
    });

    const scorePercentage = (correctCount / questions.length) * 100;

    // Always save the quiz to the backend as a Mark to ensure persistence
    if (studentId) {
        try {
            const prefix = isTeacherQuiz ? "Official Quiz: " : "Practice Quiz: ";
            await fetch('http://localhost:8081/api/marks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    subjectId: body.subjectId || "7e5a1f99-a4f5-43ec-b995-b6d34ea6ad20", // Default Python subject
                    marksObtained: correctCount,
                    maxMarks: questions.length,
                    examType: `${prefix}${body.title || "Assessment"}`
                })
            });
        } catch (e) {
            console.error("Failed to save mark:", e);
        }
    }

    return NextResponse.json({
        success: true,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        scorePercentage: Math.round(scorePercentage)
    });
}
