"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, ArrowLeft, Send, GraduationCap, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ExamPage() {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [quizData, setQuizData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const answersRef = useRef(answers);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const router = useRouter();

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        const stored = localStorage.getItem('current_quiz');
        if (!stored) {
            router.replace('/dashboard/student/quizzes');
            return;
        }

        const parsed = JSON.parse(stored);
        
        // If it's a new quiz start, set the start time
        if (!parsed.startTime) {
            parsed.startTime = Date.now();
            parsed.totalTime = parsed.questions.length * 120;
            localStorage.setItem('current_quiz', JSON.stringify(parsed));
        }

        setQuizData(parsed);

        // Calculate actual time left based on start time
        const elapsedSeconds = Math.floor((Date.now() - parsed.startTime) / 1000);
        const remTime = (parsed.totalTime) - elapsedSeconds;
        setTimeLeft(remTime > 0 ? remTime : 0);
    }, [router]);

    useEffect(() => {
        if (timeLeft <= 0 && quizData && !result) {
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, quizData, result]);

    const handleSubmit = async (finalAnswers) => {
        if (isSubmitting || !quizData) return;
        
        // Fix: If called from onClick, finalAnswers might be a MouseEvent object.
        // We only want to use it if it's the actual answers array.
        const actualAnswers = (Array.isArray(finalAnswers)) ? finalAnswers : answersRef.current;
        
        setIsSubmitting(true);

        const payloadQuestions = quizData.questions.map((q, idx) => ({
            ...q,
            studentAnswer: actualAnswers[idx] !== undefined ? q.options[actualAnswers[idx]] : null
        }));

        try {
            const res = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quizId: quizData.id,
                    studentId: session?.user?.id,
                    isTeacherQuiz: !!quizData.isTeacherQuiz,
                    title: quizData.title,
                    subject: quizData.subject,
                    questions: payloadQuestions
                })
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
                
                // Save to persistent history in localStorage so it shows instantly
                const history = JSON.parse(localStorage.getItem('quiz_history') || '[]');
                history.unshift({
                    id: Date.now().toString(),
                    title: quizData.title || "AI Practice Quiz",
                    scorePercentage: data.scorePercentage,
                    correctAnswers: data.correctAnswers,
                    totalQuestions: data.totalQuestions,
                    createdAt: new Date().toISOString()
                });
                localStorage.setItem('quiz_history', JSON.stringify(history.slice(0, 50)));

                localStorage.removeItem('current_quiz');
            } else {
                toast({ message: "Failed to submit quiz. Please try again.", type: "error" });
                setIsSubmitting(false);
            }
        } catch (error) {
            toast({ message: "Network error. Please try again.", type: "error" });
            setIsSubmitting(false);
        }
    };

    // Timer logic
    useEffect(() => {
        if (!quizData) return;
        if (timeLeft <= 0) {
            handleSubmit(answersRef.current);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, quizData]);

    const handleSelectOption = (option) => {
        setAnswers({
            ...answers,
            [currentQuestionIndex]: option
        });
    };

    if (!quizData) {
        return <div className="p-8 text-center text-gray-500 font-medium tracking-wide animate-pulse">Initializing Quiz Engine...</div>;
    }

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

    // Format time: MM:SS
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeColor = timeLeft < 60 ? 'text-red-500 bg-red-50 border border-red-200' : 'text-indigo-700 bg-indigo-50 border border-indigo-200';

    if (result) {
        return (
            <div className="max-w-xl mx-auto space-y-6 pt-12 animate-in slide-in-from-bottom duration-500">
                <div className="content-card overflow-visible">
                    <div className="content-card-body text-center p-12">
                        {/* Celebrate Icon */}
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl relative animate-bounce">
                           <GraduationCap className="w-12 h-12 text-indigo-600" />
                           <div className="absolute -top-1 -right-1 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                               <CheckCircle className="w-4 h-4" />
                           </div>
                        </div>

                        <h1 className="text-3xl font-black text-gray-900 mb-2">Quiz Completed!</h1>
                        <p className="text-gray-500 font-medium mb-8 uppercase tracking-widest text-xs">Aesthetics Online Assessment</p>

                        {/* Animated Score */}
                        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 mb-8 relative overflow-hidden group">
                           <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                           <div className="text-6xl font-black text-indigo-600 mb-1">{result.scorePercentage}%</div>
                           <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Final Score</div>
                           <div className="text-xs text-gray-400 mt-2">({result.correctAnswers} out of {result.totalQuestions} correct)</div>
                        </div>

                        {/* Breakdown */}
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="bg-white border-2 border-green-100 rounded-2xl p-4 text-center">
                                <div className="text-2xl font-black text-green-600">{result.correctAnswers}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Correct</div>
                            </div>
                            <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 text-center">
                                <div className="text-2xl font-black text-gray-400">{result.totalQuestions - result.correctAnswers}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Incorrect</div>
                            </div>
                        </div>

                        <Button 
                            className="w-full h-12 text-lg font-bold shadow-lg shadow-indigo-600/20"
                            onClick={() => router.push('/dashboard/student/quizzes')}
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pt-6">

            {/* Header / Timeline */}
            <div className="content-card flex flex-col md:flex-row items-center justify-between p-6 m-0 border-b-4 border-b-indigo-500 rounded-b-none shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">{quizData.title || "AI Generated Quiz"}</h1>
                    <p className="text-sm font-medium text-gray-500 uppercase mt-1 tracking-wider">
                        Question {currentQuestionIndex + 1} of {quizData.questions.length}
                    </p>
                </div>

                <div className={`flex items-center px-4 py-2 mt-4 md:mt-0 rounded-xl font-mono text-xl font-black ${timeColor} shadow-inner`}>
                    <Clock className="w-5 h-5 mr-3 mb-0.5 opacity-80" />
                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </div>
            </div>

            {/* Question Card */}
            <div className="content-card !rounded-t-none border-t-0 shadow-lg min-h-[400px] flex flex-col">
                <div className="content-card-body flex-1 p-8 md:p-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-10 leading-relaxed border-l-4 border-indigo-500 pl-6 w-full">
                        {currentQuestion.questionText}
                    </h2>

                    <div className="space-y-4 max-w-2xl mx-auto">
                        {currentQuestion.options.map((option, idx) => {
                            const isSelected = answers[currentQuestionIndex] === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(idx)}
                                    className={`w-full text-left p-5 rounded-xl border-2 transition-all font-medium flex items-center shadow-sm ${isSelected
                                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-indigo-600/10'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold border-2 transition-colors ${isSelected
                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                        : 'border-gray-300 text-gray-500 bg-gray-50'
                                        }`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="text-[15px] leading-relaxed flex-1">{option}</span>

                                    {/* Custom Radio Circle visually confirming selection */}
                                    <div className={`w-5 h-5 rounded-full ml-4 flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between rounded-b-2xl">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="h-11 px-6 font-semibold shadow-sm text-gray-600"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                    </Button>

                    {!isLastQuestion ? (
                        <Button
                            className="h-11 px-8 shadow-md"
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(quizData.questions.length - 1, prev + 1))}
                            disabled={answers[currentQuestionIndex] === undefined} // Force answer before next
                        >
                            Next <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 shadow-lg border-emerald-600 border"
                            onClick={handleSubmit}
                            disabled={isSubmitting || answers[currentQuestionIndex] === undefined}
                        >
                            {isSubmitting ? "Submitting..." : <><Send className="w-4 h-4 mr-2" /> Submit Quiz</>}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
