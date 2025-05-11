import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import QuizService from "@/services/quizchapitreapi";
import { Plus, Trash2, CheckCircle } from "lucide-react";

const EditQuizDialog = ({ isOpen, onClose, courseId, chapterId, quiz, onQuizUpdated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  console.log("quizzzzz edite ",quiz);

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title || "");
      setDescription(quiz.description || "");
      setTimeLimit(quiz.timeLimit || 30);
      // Format questions according to the model structure
      const formattedQuestions = Array.isArray(quiz.questions) 
        ? quiz.questions.map(q => ({
            text: q.text || "",
            options: Array.isArray(q.options) 
              ? q.options.map(opt => ({
                  text: opt.text || "",
                  isCorrect: opt.isCorrect || false
                }))
              : Array(4).fill({ text: "", isCorrect: false })
          }))
        : [];
      setQuestions(formattedQuestions);
    }
  }, [quiz]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate questions have at least one correct answer
      const invalidQuestionIndex = questions.findIndex(q => 
        !q.options.some(opt => opt.isCorrect)
      );
      
      if (invalidQuestionIndex !== -1) {
        toast.error(`La question ${invalidQuestionIndex + 1} doit avoir une réponse correcte.`);
        setLoading(false);
        return;
      }

      // Validate and format questions
      const validQuestions = questions.map(q => ({
        text: q.text.trim(),
        options: q.options.map(opt => ({
          text: opt.text.trim(),
          isCorrect: opt.isCorrect
        }))
      }));

      const updatedQuiz = await QuizService.updateQuiz(courseId, chapterId, quiz._id, {
        title: title.trim(),
        description: description.trim(),
        timeLimit: parseInt(timeLimit),
        questions: validQuestions,
        updatedAt: new Date()
      });

      toast.success("Quiz mis à jour avec succès");
      onQuizUpdated(updatedQuiz);
    } catch (error) {
      console.error("Error updating quiz:", error);
      toast.error(error.message || "Erreur lors de la mise à jour du quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      text: "",
      options: Array(4).fill().map(() => ({ text: "", isCorrect: false }))
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const handleCorrectOptionChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    // Set all options to false first
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.map(opt => ({
      ...opt,
      isCorrect: false
    }));
    // Set the selected option to true
    updatedQuestions[questionIndex].options[optionIndex].isCorrect = true;
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le Quiz</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre du quiz"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du quiz"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeLimit">Durée (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                min="1"
                required
              />
            </div>
          </div>

          {/* Questions Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Questions</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter une question
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <Label className="text-lg font-semibold">Question {questionIndex + 1}</Label>
                      <Textarea
                        value={question.text}
                        onChange={(e) => handleQuestionChange(questionIndex, "text", e.target.value)}
                        placeholder="Entrez votre question"
                        required
                        className="min-h-[100px]"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(questionIndex)}
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-md font-medium">Options de réponse</Label>
                    {question.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex} 
                        className={`flex items-center gap-2 p-2 rounded-md ${
                          option.isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-white border'
                        }`}
                      >
                        <div className="flex-grow">
                          <Input
                            value={option.text}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, "text", e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                            required
                            className={option.isCorrect ? 'border-green-300' : ''}
                          />
                        </div>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <input
                            type="radio"
                            name={`correct-${questionIndex}`}
                            checked={option.isCorrect}
                            onChange={() => handleCorrectOptionChange(questionIndex, optionIndex)}
                            className="w-4 h-4 accent-green-500"
                          />
                          <Label className={`text-sm ${option.isCorrect ? 'text-green-600 font-medium' : ''}`}>
                            {option.isCorrect ? '✓ Réponse correcte' : 'Correcte'}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuizDialog;