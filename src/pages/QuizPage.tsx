
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check, ArrowRight } from "lucide-react";

const quizQuestions = [
  {
    id: 1,
    question: "What's your living situation?",
    options: [
      { text: "Apartment without yard", value: "apartment" },
      { text: "House with small yard", value: "small_yard" },
      { text: "House with large yard", value: "large_yard" },
      { text: "Rural property", value: "rural" }
    ]
  },
  {
    id: 2,
    question: "How active is your lifestyle?",
    options: [
      { text: "Sedentary - not very active", value: "sedentary" },
      { text: "Moderately active", value: "moderate" },
      { text: "Very active - exercise daily", value: "very_active" },
      { text: "Extremely active - outdoor enthusiast", value: "extremely_active" }
    ]
  },
  {
    id: 3,
    question: "How much time can you dedicate to pet care daily?",
    options: [
      { text: "Less than 30 minutes", value: "minimal" },
      { text: "30 minutes to 1 hour", value: "low" },
      { text: "1-2 hours", value: "medium" },
      { text: "More than 2 hours", value: "high" }
    ]
  },
  {
    id: 4,
    question: "Do you have experience with pets?",
    options: [
      { text: "None - first time", value: "none" },
      { text: "Some - had pets growing up", value: "some" },
      { text: "Experienced - owned pets before", value: "experienced" },
      { text: "Expert - worked professionally with animals", value: "expert" }
    ]
  },
  {
    id: 5,
    question: "What's your budget for pet care monthly?",
    options: [
      { text: "Under $50", value: "minimal" },
      { text: "$50-$100", value: "low" },
      { text: "$100-$200", value: "medium" },
      { text: "Over $200", value: "high" }
    ]
  }
];

const QuizPage = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);
  
  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion) / quizQuestions.length) * 100;
  
  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
    setAnswers({ ...answers, [question.id]: value });
  };
  
  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(answers[quizQuestions[currentQuestion + 1].id] || null);
    } else {
      setQuizComplete(true);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[quizQuestions[currentQuestion - 1].id] || null);
    }
  };
  
  const handleSubmit = () => {
    // In a real app, we would process the answers here
    // For now, we'll just navigate back to the discovery page
    navigate("/");
  };
  
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-center mb-2">Pet Matching Quiz</h1>
          <p className="text-center text-muted-foreground">Let's find your perfect pet companion</p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">Progress</span>
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        
        {!quizComplete ? (
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-xl text-center">{question.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.options.map((option) => (
                <div 
                  key={option.value}
                  className={`
                    p-4 rounded-lg border-2 transition-all cursor-pointer flex justify-between items-center
                    ${selectedOption === option.value ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/30'}
                  `}
                  onClick={() => handleOptionSelect(option.value)}
                >
                  <span>{option.text}</span>
                  {selectedOption === option.value && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={currentQuestion === 0 ? 'invisible' : ''}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!selectedOption}
              >
                {currentQuestion < quizQuestions.length - 1 ? (
                  <>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Finish <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-center">Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="rounded-full bg-primary/20 p-6 inline-flex">
                <Check className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold mt-4">Thank you for completing the quiz!</h2>
              <p className="text-muted-foreground mt-2">
                Our AI is analyzing your responses to find the perfect pet matches for you.
              </p>
            </CardContent>
            <CardFooter className="justify-center">
              <Button onClick={handleSubmit} className="w-full" size="lg">
                See My Results <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
