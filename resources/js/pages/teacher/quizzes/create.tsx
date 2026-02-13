import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import {
    FileQuestion,
    Plus,
    Trash2,
    GripVertical,
    ChevronDown,
    ChevronUp,
    Save,
    ArrowLeft,
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quizzes',
        href: '/teacher/quizzes',
    },
    {
        title: 'Create Quiz',
        href: '/teacher/quizzes/create',
    },
];

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface Answer {
    id?: number;
    answer: string;
    is_correct: boolean;
}

interface Question {
    id?: number;
    type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
    question: string;
    explanation: string;
    points: number;
    answers: Answer[];
    isOpen?: boolean;
}

interface Props {
    subjects: Subject[];
}

export default function QuizCreate({ subjects }: Props) {
    const [questions, setQuestions] = useState<Question[]>([
        {
            type: 'multiple_choice',
            question: '',
            explanation: '',
            points: 1,
            answers: [
                { answer: '', is_correct: true },
                { answer: '', is_correct: false },
                { answer: '', is_correct: false },
                { answer: '', is_correct: false },
            ],
            isOpen: true,
        },
    ]);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        subject_id: '',
        time_limit_minutes: '',
        passing_score: 60,
        max_attempts: 1,
        shuffle_questions: false,
        shuffle_answers: false,
        show_correct_answers: true,
        available_from: '',
        available_until: '',
    });

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                type: 'multiple_choice',
                question: '',
                explanation: '',
                points: 1,
                answers: [
                    { answer: '', is_correct: true },
                    { answer: '', is_correct: false },
                    { answer: '', is_correct: false },
                    { answer: '', is_correct: false },
                ],
                isOpen: true,
            },
        ]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };

        // If changing type to true_false, set default answers
        if (field === 'type' && value === 'true_false') {
            newQuestions[index].answers = [
                { answer: 'True', is_correct: true },
                { answer: 'False', is_correct: false },
            ];
        }
        // If changing type to multiple_choice from true_false, reset answers
        if (field === 'type' && value === 'multiple_choice' && newQuestions[index].answers.length === 2) {
            newQuestions[index].answers = [
                { answer: '', is_correct: true },
                { answer: '', is_correct: false },
                { answer: '', is_correct: false },
                { answer: '', is_correct: false },
            ];
        }
        // If changing to short_answer or essay, clear answers
        if (field === 'type' && (value === 'short_answer' || value === 'essay')) {
            newQuestions[index].answers = [];
        }

        setQuestions(newQuestions);
    };

    const addAnswer = (questionIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].answers.push({ answer: '', is_correct: false });
        setQuestions(newQuestions);
    };

    const removeAnswer = (questionIndex: number, answerIndex: number) => {
        const newQuestions = [...questions];
        if (newQuestions[questionIndex].answers.length > 2) {
            newQuestions[questionIndex].answers = newQuestions[questionIndex].answers.filter(
                (_, i) => i !== answerIndex
            );
            setQuestions(newQuestions);
        }
    };

    const updateAnswer = (questionIndex: number, answerIndex: number, field: keyof Answer, value: any) => {
        const newQuestions = [...questions];

        if (field === 'is_correct' && value === true) {
            // For multiple choice and true_false, only one correct answer
            newQuestions[questionIndex].answers = newQuestions[questionIndex].answers.map(
                (a, i) => ({ ...a, is_correct: i === answerIndex })
            );
        } else {
            newQuestions[questionIndex].answers[answerIndex] = {
                ...newQuestions[questionIndex].answers[answerIndex],
                [field]: value,
            };
        }

        setQuestions(newQuestions);
    };

    const toggleQuestionOpen = (index: number) => {
        const newQuestions = [...questions];
        newQuestions[index].isOpen = !newQuestions[index].isOpen;
        setQuestions(newQuestions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = {
            ...data,
            time_limit_minutes: data.time_limit_minutes || null,
            questions: questions.map((q, index) => ({
                type: q.type,
                question: q.question,
                explanation: q.explanation,
                points: q.points,
                order: index + 1,
                answers: q.answers.map((a, i) => ({
                    answer: a.answer,
                    is_correct: a.is_correct,
                    order: i + 1,
                })),
            })),
        };

        router.post('/teacher/quizzes', formData);
    };

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Quiz" />

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/teacher/quizzes">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Create Quiz</h1>
                                <p className="text-muted-foreground">
                                    Add a new quiz for your students
                                </p>
                            </div>
                        </div>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Quiz
                        </Button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Quiz Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quiz Details</CardTitle>
                                    <CardDescription>Basic information about your quiz</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Enter quiz title"
                                            required
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-destructive">{errors.title}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Enter quiz description (optional)"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject_id">Subject *</Label>
                                        <Select
                                            value={data.subject_id}
                                            onValueChange={(value) => setData('subject_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map((subject) => (
                                                    <SelectItem key={subject.id} value={subject.id.toString()}>
                                                        {subject.code} - {subject.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.subject_id && (
                                            <p className="text-sm text-destructive">{errors.subject_id}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Questions */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Questions</CardTitle>
                                            <CardDescription>
                                                {questions.length} question{questions.length !== 1 ? 's' : ''} • {totalPoints} total points
                                            </CardDescription>
                                        </div>
                                        <Button type="button" onClick={addQuestion} size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Question
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {questions.map((question, qIndex) => (
                                        <Collapsible
                                            key={qIndex}
                                            open={question.isOpen}
                                            onOpenChange={() => toggleQuestionOpen(qIndex)}
                                        >
                                            <Card className="border-dashed">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <CollapsibleTrigger asChild>
                                                            <Button variant="ghost" className="flex items-center gap-2 -ml-2 p-2 h-auto">
                                                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                                <span className="font-medium">Question {qIndex + 1}</span>
                                                                {question.isOpen ? (
                                                                    <ChevronUp className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </CollapsibleTrigger>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-muted-foreground">
                                                                {question.points} pt{question.points !== 1 ? 's' : ''}
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeQuestion(qIndex)}
                                                                disabled={questions.length === 1}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CollapsibleContent>
                                                    <CardContent className="space-y-4 pt-0">
                                                        <div className="grid gap-4 sm:grid-cols-2">
                                                            <div className="space-y-2">
                                                                <Label>Question Type</Label>
                                                                <Select
                                                                    value={question.type}
                                                                    onValueChange={(value) =>
                                                                        updateQuestion(qIndex, 'type', value)
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="multiple_choice">
                                                                            Multiple Choice
                                                                        </SelectItem>
                                                                        <SelectItem value="true_false">
                                                                            True/False
                                                                        </SelectItem>
                                                                        <SelectItem value="short_answer">
                                                                            Short Answer
                                                                        </SelectItem>
                                                                        <SelectItem value="essay">Essay</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Points</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={question.points}
                                                                    onChange={(e) =>
                                                                        updateQuestion(
                                                                            qIndex,
                                                                            'points',
                                                                            parseInt(e.target.value) || 1
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Question Text *</Label>
                                                            <Textarea
                                                                value={question.question}
                                                                onChange={(e) =>
                                                                    updateQuestion(qIndex, 'question', e.target.value)
                                                                }
                                                                placeholder="Enter your question"
                                                                rows={2}
                                                            />
                                                        </div>

                                                        {/* Answers for multiple choice and true/false */}
                                                        {(question.type === 'multiple_choice' ||
                                                            question.type === 'true_false') && (
                                                            <div className="space-y-3">
                                                                <Label>Answers</Label>
                                                                {question.answers.map((answer, aIndex) => (
                                                                    <div
                                                                        key={aIndex}
                                                                        className="flex items-center gap-3"
                                                                    >
                                                                        <Checkbox
                                                                            checked={answer.is_correct}
                                                                            onCheckedChange={(checked) =>
                                                                                updateAnswer(
                                                                                    qIndex,
                                                                                    aIndex,
                                                                                    'is_correct',
                                                                                    checked
                                                                                )
                                                                            }
                                                                        />
                                                                        <Input
                                                                            value={answer.answer}
                                                                            onChange={(e) =>
                                                                                updateAnswer(
                                                                                    qIndex,
                                                                                    aIndex,
                                                                                    'answer',
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            placeholder={`Answer ${aIndex + 1}`}
                                                                            disabled={question.type === 'true_false'}
                                                                            className="flex-1"
                                                                        />
                                                                        {question.type === 'multiple_choice' && (
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() =>
                                                                                    removeAnswer(qIndex, aIndex)
                                                                                }
                                                                                disabled={
                                                                                    question.answers.length <= 2
                                                                                }
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {question.type === 'multiple_choice' && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => addAnswer(qIndex)}
                                                                    >
                                                                        <Plus className="mr-2 h-4 w-4" />
                                                                        Add Answer
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Note for short answer and essay */}
                                                        {(question.type === 'short_answer' ||
                                                            question.type === 'essay') && (
                                                            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                                                                {question.type === 'short_answer'
                                                                    ? 'Short answer questions will require manual grading.'
                                                                    : 'Essay questions will require manual grading.'}
                                                            </div>
                                                        )}

                                                        <div className="space-y-2">
                                                            <Label>Explanation (shown after submission)</Label>
                                                            <Textarea
                                                                value={question.explanation}
                                                                onChange={(e) =>
                                                                    updateQuestion(qIndex, 'explanation', e.target.value)
                                                                }
                                                                placeholder="Explain the correct answer (optional)"
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Card>
                                        </Collapsible>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Settings Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quiz Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                                        <Input
                                            id="time_limit"
                                            type="number"
                                            min="1"
                                            value={data.time_limit_minutes}
                                            onChange={(e) => setData('time_limit_minutes', e.target.value)}
                                            placeholder="No limit"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="passing_score">Passing Score (%)</Label>
                                        <Input
                                            id="passing_score"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={data.passing_score}
                                            onChange={(e) =>
                                                setData('passing_score', parseInt(e.target.value) || 0)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="max_attempts">Max Attempts</Label>
                                        <Input
                                            id="max_attempts"
                                            type="number"
                                            min="1"
                                            value={data.max_attempts}
                                            onChange={(e) =>
                                                setData('max_attempts', parseInt(e.target.value) || 1)
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="shuffle_questions">Shuffle Questions</Label>
                                        <Switch
                                            id="shuffle_questions"
                                            checked={data.shuffle_questions}
                                            onCheckedChange={(checked) =>
                                                setData('shuffle_questions', checked)
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="shuffle_answers">Shuffle Answers</Label>
                                        <Switch
                                            id="shuffle_answers"
                                            checked={data.shuffle_answers}
                                            onCheckedChange={(checked) =>
                                                setData('shuffle_answers', checked)
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="show_correct_answers">Show Correct Answers</Label>
                                        <Switch
                                            id="show_correct_answers"
                                            checked={data.show_correct_answers}
                                            onCheckedChange={(checked) =>
                                                setData('show_correct_answers', checked)
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Availability</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="available_from">Available From</Label>
                                        <Input
                                            id="available_from"
                                            type="datetime-local"
                                            value={data.available_from}
                                            onChange={(e) => setData('available_from', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="available_until">Available Until</Label>
                                        <Input
                                            id="available_until"
                                            type="datetime-local"
                                            value={data.available_until}
                                            onChange={(e) => setData('available_until', e.target.value)}
                                        />
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        Leave empty for no restrictions. Quiz will be saved as draft and can be published later.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </form>
        </TeacherLayout>
    );
}
