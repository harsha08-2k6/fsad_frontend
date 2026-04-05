import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();
    const count = parseInt(body.questionCount) || 10;
    const finalCount = count > 10 ? 10 : count; // Cap at 10

    // The user requested that these specific questions are shown regardless of the selection
    const allQuestions = [
        {
          questionText: "Which language is mainly used for backend in Python full stack?",
          options: ["HTML", "CSS", "Python", "JavaScript"],
          correctOptionIndex: 2,
          points: 1
        },
        {
          questionText: "Which of the following is a Python web framework?",
          options: ["React", "Django", "Angular", "Bootstrap"],
          correctOptionIndex: 1,
          points: 1
        },
        {
          questionText: "Which framework is lightweight in Python?",
          options: ["Django", "Flask", "Spring", "Laravel"],
          correctOptionIndex: 1,
          points: 1
        },
        {
          questionText: "Which is used for frontend development?",
          options: ["Python", "MySQL", "HTML", "Django"],
          correctOptionIndex: 2,
          points: 1
        },
        {
          questionText: "What does REST stand for?",
          options: ["Remote Execution State Transfer", "Representational State Transfer", "Rapid System Transfer", "Real State Technology"],
          correctOptionIndex: 1,
          points: 1
        },
        {
          questionText: "Which database is commonly used with Python?",
          options: ["MySQL", "Oracle", "PostgreSQL", "All of the above"],
          correctOptionIndex: 3,
          points: 1
        },
        {
          questionText: "Which HTTP method is used to fetch data?",
          options: ["POST", "GET", "DELETE", "PUT"],
          correctOptionIndex: 1,
          points: 1
        },
        {
          questionText: "What is the use of ORM?",
          options: ["Designing UI", "Writing HTML", "Interacting with database using objects", "Styling pages"],
          correctOptionIndex: 2,
          points: 1
        },
        {
          questionText: "Which template engine is used in Flask?",
          options: ["JSP", "Thymeleaf", "Jinja2", "Blade"],
          correctOptionIndex: 2,
          points: 1
        },
        {
          questionText: "Which architecture is used in Django?",
          options: ["MVC", "MVT", "MVP", "MVVM"],
          correctOptionIndex: 1,
          points: 1
        }
    ];

    // Take only the number of questions selected by the student
    const questions = allQuestions.slice(0, finalCount);

    return NextResponse.json({
        success: true,
        questions: questions
    });
}
