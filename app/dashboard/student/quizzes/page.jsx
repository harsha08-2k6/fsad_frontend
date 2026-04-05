"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Brain, FileCheck2, TrendingUp, History, Play, AlertCircle, Sparkles, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useSession } from "next-auth/react";

export default function StudentQuizzesPage() {
    const { toast } = useToast();
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('generate');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [topics, setTopics] = useState([]);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [difficulty, setDifficulty] = useState("medium");
    const [questionCount, setQuestionCount] = useState(10);
    const [loading, setLoading] = useState(false);

    // Added teacher quizzes state
    const [teacherQuizzes, setTeacherQuizzes] = useState([]);

    // History and Analytics State
    const [history, setHistory] = useState([]);
    const [analytics, setAnalytics] = useState({ strongTopics: [], weakTopics: [] });
    const router = useRouter();

    const [ongoingQuiz, setOngoingQuiz] = useState(null);

    useEffect(() => {
        fetch('/api/subjects').then(res => res.json()).then(data => setSubjects(data));
        fetchHistory();
        fetchAnalytics();
        if (session?.user?.classId) {
            fetchTeacherQuizzes(session.user.classId);
        }

        // Track ongoing quiz from local storage
        const stored = localStorage.getItem('current_quiz');
        if (stored) {
            const parsed = JSON.parse(stored);
            const now = Date.now();
            const totalTimeMs = parsed.questions.length * 120 * 1000;
            const expiry = (parsed.startTime || 0) + totalTimeMs;
            
            if (now < expiry) {
                setOngoingQuiz(parsed);
            } else {
                localStorage.removeItem('current_quiz');
            }
        }
    }, [session]);

    const fetchTeacherQuizzes = async (classId) => {
        try {
            const res = await fetch(`/api/quizzes?classId=${classId}`);
            if (res.ok) {
                const data = await res.json();
                setTeacherQuizzes(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Failed to fetch quizzes", error);
        }
    };

    const fetchHistory = async () => {
        const studentId = session?.user?.id;
        if (!studentId) return;
        
        try {
            // Fetch both practice history and real official exam marks
            const [historyRes, marksRes] = await Promise.all([
                fetch(`/api/quiz/history?studentId=${studentId}`),
                fetch(`/api/marks/student/${studentId}`)
            ]);
            
            const apiHistory = await historyRes.json();
            const marksData = await marksRes.json();
            
            // Practice history from local storage
            const localHistory = JSON.parse(localStorage.getItem('quiz_history') || '[]');
            
            // Map marks into history format
            const officialHistory = (Array.isArray(marksData) ? marksData : []).map(m => ({
                id: m.id,
                title: m.examType,
                subject: m.subjectId || { name: "Examination" },
                scorePercentage: Math.round((m.marksObtained / m.maxMarks) * 100),
                correctAnswers: m.marksObtained,
                totalQuestions: m.maxMarks,
                createdAt: m.createdAt || new Date().toISOString(),
                isOfficial: m.examType?.includes("Official Quiz")
            }));

            // Practice history might still be in local storage for instantaneous updates, but we'll fetch everything from backend now.
            // The officialHistory now contains both official quizzes and AI practice quizzes from the backend DB.
            
            // Merge everything (Remove fake apiHistory and avoid duplicating localHistory which is now in DB)
            const combined = [...officialHistory];
            
            // Sort by most recent
            combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            setHistory(combined);
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    const fetchAnalytics = async () => {
        const studentId = session?.user?.id;
        if (!studentId) return;
        const res = await fetch(`/api/quiz/analytics?studentId=${studentId}`);
        if (res.ok) {
            const data = await res.json();
            setAnalytics(data);
        }
    };

    useEffect(() => {
        if (selectedSubject) {
            fetch(`/api/topics?subjectId=${selectedSubject}`).then(res => res.json()).then(data => {
                setTopics(data);
                setSelectedTopics([]); // reset selection
            });
        }
    }, [selectedSubject]);

    const handleTopicToggle = (topicId) => {
        if (selectedTopics.includes(topicId)) {
            setSelectedTopics(selectedTopics.filter(id => id !== topicId));
        } else {
            setSelectedTopics([...selectedTopics, topicId]);
        }
    };

    const handleStartTeacherQuiz = (quiz) => {
        // Transform teacher quiz format to match the internal quiz format used by the exam view
        const quizPayload = {
            id: quiz.id,
            title: quiz.title,
            subject: quiz.subject?.name,
            questions: quiz.questions,
            isTeacherQuiz: true
        };
        localStorage.setItem('current_quiz', JSON.stringify(quizPayload));
        router.push('/dashboard/student/quizzes/exam');
    };

    const handleGenerate = async () => {
        // Block if there's already an active quiz in progress
        if (ongoingQuiz) {
            toast({ 
                title: "Quiz in Progress", 
                description: "You already have an active quiz session. Please complete or resume it before starting a new one.", 
                variant: "destructive" 
            }); 
            return; 
        }

        if (!selectedSubject) { toast({ message: "Please select a subject.", type: "warning" }); return; }
        if (selectedTopics.length === 0) { toast({ message: "Please select at least one topic.", type: "warning" }); return; }
        if (questionCount < 1 || questionCount > 10) { 
            toast({ 
                title: "Maximum Limit Reached", 
                description: "You can only generate a maximum of 10 questions at a time.", 
                variant: "destructive" 
            }); 
            return; 
        }

        setLoading(true);
        try {
            const res = await fetch('/api/quiz/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subjectId: selectedSubject,
                    topicIds: selectedTopics,
                    difficulty,
                    questionCount,
                    studentId: session?.user?.id
                })
            });

            const data = await res.json();
            if (res.ok) {
                // Store in local storage to pass to exam view immediately
                const quizPayload = {
                    subject: subjects.find(s => s.id === selectedSubject)?.name,
                    topics: selectedTopics,
                    difficulty,
                    questions: data.questions,
                    isAI: true
                };
                localStorage.setItem('current_quiz', JSON.stringify(quizPayload));
                router.push('/dashboard/student/quizzes/exam');
            } else {
                toast({ title: "Error", description: `Error generating quiz: ${data.message}`, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="page-header mb-8">
                <h1 className="page-title flex items-center">
                    <Brain className="w-8 h-8 mr-3 text-indigo-600" />
                    Quizzes & Assessments
                </h1>
                <p className="page-subtitle">Test your knowledge with official assessments or AI-generated practice quizzes.</p>
            </div>

            {/* Custom Tabs */}
            <div className="flex space-x-6 border-b border-gray-100 px-2">
                <button
                    onClick={() => setActiveTab('generate')}
                    className={`px-4 py-3 border-b-2 font-bold text-sm transition-all duration-300 ${activeTab === 'generate' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'}`}
                >
                    <Sparkles className="w-4 h-4 inline-block mr-2 text-indigo-500" />
                    AI Generator
                </button>
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-3 border-b-2 font-bold text-sm transition-all duration-300 ${activeTab === 'active' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'}`}
                >
                    <LayoutDashboard className="w-4 h-4 inline-block mr-2" />
                    Active Quizzes
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-3 border-b-2 font-bold text-sm transition-all duration-300 ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'}`}
                >
                    <History className="w-4 h-4 inline-block mr-2" />
                    History
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-4 py-2 border-b-2 font-semibold text-sm transition-colors ${activeTab === 'analytics' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                    <TrendingUp className="w-4 h-4 inline-block mr-2" />
                    Analytics
                </button>
            </div>

            {/* ACTIVE QUIZZES TAB */}
            {activeTab === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ongoingQuiz && (
                        <div className="content-card border-2 border-indigo-500 shadow-indigo-100 shadow-xl bg-gradient-to-br from-indigo-50/50 to-white animate-in zoom-in-95 duration-300">
                            <div className="content-card-body p-6 flex flex-col h-full relative overflow-hidden">
                                <div className="absolute -top-6 -right-6 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                                        <Brain className="w-6 h-6 text-white animate-pulse" />
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 bg-white border border-indigo-200 px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                                            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping" />
                                            In Progress
                                        </span>
                                    </div>
                                </div>
                                <h3 className="font-black text-xl text-indigo-950 mb-2 mt-2 leading-tight">{ongoingQuiz.title || "Ongoing Practice"}</h3>
                                <p className="text-sm text-indigo-700/60 font-medium mb-6 flex-1">You have an active session running. Resume now to complete your assessment before the timer expires.</p>
                                <Button 
                                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wide shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                                    onClick={() => router.push('/dashboard/student/quizzes/exam')}
                                >
                                    Resume Assessment
                                </Button>
                            </div>
                        </div>
                    )}
                    {teacherQuizzes.length > 0 ? teacherQuizzes.map(quiz => (
                        <div key={quiz.id} className="content-card hover:border-indigo-300 transition-all group">
                            <div className="content-card-body p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                        <FileCheck2 className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider"> Official </span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2">{quiz.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{quiz.description}</p>
                                <div className="flex items-center text-xs text-gray-400 mb-6 gap-3">
                                    <span className="flex items-center"><Brain className="w-3 h-3 mr-1" /> {quiz.questions?.length || 0} Questions</span>
                                    <span className="flex items-center"><Play className="w-3 h-3 mr-1" /> {quiz.subject?.name}</span>
                                </div>
                                <Button className="w-full h-10" onClick={() => handleStartTeacherQuiz(quiz)}>
                                    Start Assessment
                                </Button>
                            </div>
                        </div>
                    )) : !ongoingQuiz && (
                        <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                             <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <FileCheck2 className="w-8 h-8 text-gray-300" />
                             </div>
                             <h3 className="font-bold text-gray-900 text-lg">No Active Assessments</h3>
                             <p className="text-gray-500 max-w-xs mx-auto mt-2">There are currently no official quizzes assigned to your class. Keep practicing with AI!</p>
                        </div>
                    )}
                </div>
            )}

            {/* GENERATE TAB */}
            {activeTab === 'generate' && (
                <div className="content-card">
                    <div className="content-card-header bg-gradient-to-r from-indigo-50 to-white">
                        <h2 className="content-card-title flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-indigo-600" /> Configure Your Quiz
                        </h2>
                    </div>
                    <div className="content-card-body space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label className="mb-2 block font-semibold text-gray-700">1. Select Subject</Label>
                                <select
                                    className="form-input-styled w-full"
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                >
                                    <option value="" disabled>-- Select a subject --</option>
                                    {subjects.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label className="mb-2 block font-semibold text-gray-700">2. Select Topics</Label>
                                {selectedSubject ? (
                                    topics.length > 0 ? (
                                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50/50 space-y-1">
                                            {topics.map(topic => (
                                                <label key={topic.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                        checked={selectedTopics.includes(topic.id)}
                                                        onChange={() => handleTopicToggle(topic.id)}
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">{topic.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg flex items-center border border-amber-200">
                                            <AlertCircle className="w-4 h-4 mr-2" /> No topics available for this subject yet.
                                        </div>
                                    )
                                ) : (
                                    <div className="text-sm text-gray-400 italic p-3 border border-dashed border-gray-200 rounded-lg">Select a subject first...</div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                            <div>
                                <Label className="mb-2 block font-semibold text-gray-700">3. Difficulty Level</Label>
                                <div className="flex gap-3">
                                    {['easy', 'medium', 'hard'].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setDifficulty(level)}
                                            className={`flex-1 py-2 px-3 rounded-xl border text-sm font-semibold capitalize transition-all ${difficulty === level ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'}`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label className="mb-2 block font-semibold text-gray-700">4. Number of Questions</Label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        className="form-input-styled w-24 text-center font-bold text-lg"
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(e.target.value)}
                                    />
                                    <span className="text-sm text-gray-500 font-medium">questions <br />(2 mins each)</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button
                                className="h-12 px-8 text-base shadow-[0_4px_16px_rgba(79,70,229,0.3)] hover:-translate-y-1"
                                onClick={handleGenerate}
                                disabled={loading || !selectedSubject || selectedTopics.length === 0}
                            >
                                {loading ? (
                                    "✨ AI Generating Quiz..."
                                ) : (
                                    <><Play className="w-5 h-5 mr-2" /> Generate & Start Quiz</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
                <div className="content-card">
                    <div className="content-card-header">
                        <h2 className="content-card-title flex items-center">
                            <History className="w-5 h-5 mr-2 text-indigo-600" /> Quiz History
                        </h2>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Subject</th>
                                <th>Difficulty</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {history.length > 0 ? history.map(attempt => (
                                <tr key={attempt.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                        {new Date(attempt.createdAt || attempt.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{attempt.title || attempt.subject?.name || "Quiz Attempt"}</div>
                                        <div className="text-xs text-gray-500">{(attempt.topics?.length || 0)} topics | {attempt.isOfficial ? "Official" : "Practice"}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`badge ${attempt.difficulty === 'easy' ? 'bg-green-100 text-green-800' : attempt.difficulty === 'hard' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'} capitalize rounded-full px-2 py-0.5 text-[10px] font-bold`}>
                                            {attempt.difficulty || "Regular"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-lg font-black text-gray-900 w-12">{Math.round(attempt.scorePercentage)}%</div>
                                            <div className="text-xs font-semibold text-gray-400 ml-2">
                                                ({attempt.correctAnswers}/{attempt.totalQuestions})
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium bg-gray-50/30">
                                        No quiz attempts found. Best of luck generating your first AI Quiz!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Weak Topics */}
                        <div className="content-card overflow-hidden">
                            <div className="content-card-header bg-rose-50/50 border-b border-rose-100">
                                <h2 className="content-card-title flex items-center text-rose-700">
                                    <AlertCircle className="w-5 h-5 mr-2" /> Areas for Improvement (Weak Topics)
                                </h2>
                            </div>
                            <div className="content-card-body p-0">
                                {analytics.weakTopics.length > 0 ? (
                                    <ul className="divide-y divide-gray-100">
                                        {analytics.weakTopics.map(t => (
                                            <li key={t.topicId} className="p-4 flex items-center justify-between hover:bg-rose-50/30 rounded-lg m-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{t.topicName}</h3>
                                                    <p className="text-xs font-medium text-gray-500 mt-0.5">Attempted {t.totalAttempted} questions</p>
                                                </div>
                                                <div className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg font-black text-lg border border-rose-200">
                                                    {t.accuracy}%
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-8 text-center text-sm font-medium text-green-600 bg-green-50/30 m-4 rounded-xl border border-green-100">
                                        You don't have any weak topics yet! Keep up the great work.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Strong Topics */}
                        <div className="content-card overflow-hidden">
                            <div className="content-card-header bg-emerald-50/50 border-b border-emerald-100">
                                <h2 className="content-card-title flex items-center text-emerald-700">
                                    <FileCheck2 className="w-5 h-5 mr-2" /> Mastered Concepts (Strong Topics)
                                </h2>
                            </div>
                            <div className="content-card-body p-0">
                                {analytics.strongTopics.length > 0 ? (
                                    <ul className="divide-y divide-gray-100">
                                        {analytics.strongTopics.map(t => (
                                            <li key={t.topicId} className="p-4 flex items-center justify-between hover:bg-emerald-50/30 rounded-lg m-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{t.topicName}</h3>
                                                    <p className="text-xs font-medium text-gray-500 mt-0.5">Attempted {t.totalAttempted} questions</p>
                                                </div>
                                                <div className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-black text-lg border border-emerald-200">
                                                    {t.accuracy}%
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-8 text-center text-sm font-medium text-gray-500 bg-gray-50/50 m-4 rounded-xl border border-gray-100">
                                        Complete more quizzes to identify your strongest topics.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
