import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/layouts/student/student-layout';
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    Send,
    AlertCircle,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

interface Answer {
    id: number;
    answer: string;
    is_correct: boolean;
    order: number;
}

interface Question {
    id: number;
    type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
    question: string;
    points: number;
    order: number;
    answers: Answer[];
}

interface Quiz {
    id: number;
    title: string;
    time_limit_minutes: number | null;
    shuffle_questions: boolean;
    shuffle_answers: boolean;
}

interface Attempt {
    id: number;
    started_at: string;
}

interface ExistingResponse {
    question_id: number;
    answer_id: number | null;
    text_response: string | null;
}

interface Props {
    attempt: Attempt;
    quiz: Quiz;
    questions: Question[];
    existingResponses: Record<number, ExistingResponse>;
    remainingTime: number | null;
}

export default function QuizTake({
    attempt,
    quiz,
    questions,
    existingResponses,
    remainingTime: initialRemainingTime,
}: Props) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState<Record<number, { answer_id?: number; text_response?: string }>>(() => {
        const initial: Record<number, { answer_id?: number; text_response?: string }> = {};
        Object.values(existingResponses).forEach((response) => {
            initial[response.question_id] = {
                answer_id: response.answer_id || undefined,
                text_response: response.text_response || undefined,
            };
        });
        return initial;
    });
    const [remainingTime, setRemainingTime] = useState(initialRemainingTime);
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
    const [timeWarningShown, setTimeWarningShown] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Quizzes', href: '/student/quizzes' },
        { title: quiz.title, href: `/student/quizzes/${quiz.id}` },
        { title: 'Taking Quiz', href: '#' },
    ];

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(responses).filter(
        (qId) => responses[parseInt(qId)]?.answer_id || responses[parseInt(qId)]?.text_response
    ).length;

    // Timer
    useEffect(() => {
        if (remainingTime === null) return;

        const timer = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev === null) return null;
                if (prev <= 0) {
                    handleSubmit();
                    return 0;
                }
                if (prev === 60 && !timeWarningShown) {
                    setTimeWarningShown(true);
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [remainingTime, timeWarningShown]);

    // Auto-save responses
    const saveResponse = useCallback((questionId: number, data: { answer_id?: number; text_response?: string }) => {
        router.post(`/student/quizzes/take/${attempt.id}/save`, {
            question_id: questionId,
            answer_id: data.answer_id || null,
            text_response: data.text_response || null,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [attempt.id]);

    const handleAnswerChange = (questionId: number, answerId: number) => {
        setResponses((prev) => ({
            ...prev,
            [questionId]: { ...prev[questionId], answer_id: answerId },
        }));
        saveResponse(questionId, { answer_id: answerId });
    };

    const handleTextChange = (questionId: number, text: string) => {
        setResponses((prev) => ({
            ...prev,
            [questionId]: { ...prev[questionId], text_response: text },
        }));
    };

    const handleTextBlur = (questionId: number) => {
        const text = responses[questionId]?.text_response;
        if (text) {
            saveResponse(questionId, { text_response: text });
        }
    };

    const handleSubmit = () => {
        router.post(`/student/quizzes/take/${attempt.id}/submit`, {
            responses: responses,
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const goToQuestion = (index: number) => {
        if (index >= 0 && index < totalQuestions) {
            setCurrentQuestionIndex(index);
        }
    };

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title={`Taking: ${quiz.title}`} />

            <div className="flex flex-col gap-6">
                {/* Header with Timer */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sticky top-0 z-10 bg-background py-4 border-b">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{quiz.title}</h1>
                        <p className="text-sm text-muted-foreground">
                            Question {currentQuestionIndex + 1} of {totalQuestions}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {remainingTime !== null && (
                            <div
                                className={cn(
                                    'flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-semibold',
                                    remainingTime <= 60
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 animate-pulse'
                                        : remainingTime <= 300
                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                        : 'bg-muted'
                                )}
                            >
                                <Clock className="h-5 w-5" />
                                {formatTime(remainingTime)}
                            </div>
                        )}
                        <Button onClick={() => setSubmitDialogOpen(true)}>
                            <Send className="mr-2 h-4 w-4" />
                            Submit Quiz
                        </Button>
                    </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{answeredCount} of {totalQuestions} answered</span>
                        <span>{Math.round((answeredCount / totalQuestions) * 100)}%</span>
                    </div>
                    <Progress value={(answeredCount / totalQuestions) * 100} />
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Question Navigation */}
                    <Card className="lg:col-span-1 h-fit">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((q, index) => {
                                    const isAnswered = responses[q.id]?.answer_id || responses[q.id]?.text_response;
                                    const isCurrent = index === currentQuestionIndex;
                                    return (
                                        <Button
                                            key={q.id}
                                            variant={isCurrent ? 'default' : isAnswered ? 'secondary' : 'outline'}
                                            size="sm"
                                            className={cn(
                                                'h-10 w-10 p-0',
                                                isAnswered && !isCurrent && 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                                            )}
                                            onClick={() => goToQuestion(index)}
                                        >
                                            {index + 1}
                                        </Button>
                                    );
                                })}
                            </div>
                            <div className="mt-4 space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded bg-green-100 dark:bg-green-900" />
                                    <span>Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded border" />
                                    <span>Unanswered</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Current Question */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg">
                                        Question {currentQuestionIndex + 1}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <span className="rounded bg-muted px-2 py-1 text-xs font-medium">
                                    {currentQuestion.type.replace('_', ' ')}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-lg">{currentQuestion.question}</p>

                            {/* Multiple Choice / True False */}
                            {(currentQuestion.type === 'multiple_choice' ||
                                currentQuestion.type === 'true_false') && (
                                <RadioGroup
                                    value={responses[currentQuestion.id]?.answer_id?.toString() || ''}
                                    onValueChange={(value) =>
                                        handleAnswerChange(currentQuestion.id, parseInt(value))
                                    }
                                    className="space-y-3"
                                >
                                    {currentQuestion.answers.map((answer) => (
                                        <div
                                            key={answer.id}
                                            className={cn(
                                                'flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors',
                                                responses[currentQuestion.id]?.answer_id === answer.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'hover:bg-muted/50'
                                            )}
                                            onClick={() =>
                                                handleAnswerChange(currentQuestion.id, answer.id)
                                            }
                                        >
                                            <RadioGroupItem
                                                value={answer.id.toString()}
                                                id={`answer-${answer.id}`}
                                            />
                                            <Label
                                                htmlFor={`answer-${answer.id}`}
                                                className="flex-1 cursor-pointer"
                                            >
                                                {answer.answer}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}

                            {/* Short Answer */}
                            {currentQuestion.type === 'short_answer' && (
                                <Textarea
                                    value={responses[currentQuestion.id]?.text_response || ''}
                                    onChange={(e) =>
                                        handleTextChange(currentQuestion.id, e.target.value)
                                    }
                                    onBlur={() => handleTextBlur(currentQuestion.id)}
                                    placeholder="Type your answer here..."
                                    rows={3}
                                />
                            )}

                            {/* Essay */}
                            {currentQuestion.type === 'essay' && (
                                <Textarea
                                    value={responses[currentQuestion.id]?.text_response || ''}
                                    onChange={(e) =>
                                        handleTextChange(currentQuestion.id, e.target.value)
                                    }
                                    onBlur={() => handleTextBlur(currentQuestion.id)}
                                    placeholder="Write your essay response here..."
                                    rows={8}
                                />
                            )}

                            {/* Navigation */}
                            <div className="flex justify-between pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => goToQuestion(currentQuestionIndex - 1)}
                                    disabled={currentQuestionIndex === 0}
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Previous
                                </Button>
                                {currentQuestionIndex < totalQuestions - 1 ? (
                                    <Button onClick={() => goToQuestion(currentQuestionIndex + 1)}>
                                        Next
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button onClick={() => setSubmitDialogOpen(true)}>
                                        <Send className="mr-2 h-4 w-4" />
                                        Submit Quiz
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Submit Confirmation Dialog */}
            <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {answeredCount < totalQuestions ? (
                                <span className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                    <AlertCircle className="h-4 w-4" />
                                    You have {totalQuestions - answeredCount} unanswered question
                                    {totalQuestions - answeredCount !== 1 ? 's' : ''}.
                                </span>
                            ) : (
                                'You have answered all questions.'
                            )}
                            <br />
                            <br />
                            Are you sure you want to submit? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit}>Submit Quiz</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </StudentLayout>
    );
}
