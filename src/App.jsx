import React, { useState } from 'react';

const App = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');

  const sections = [
    {
      title: "Current Positioning",
      questions: [
        "What is your current value positioning and key message?"
      ]
    },
    {
      title: "ICP Foundation", 
      questions: [
        "How would you describe your ideal customer (ICP) - company size, role, industry?",
        "What are your average deal sizes and current goals for the next 12-24 months?"
      ]
    },
    {
      title: "Dream Outcome & Status Elevation",
      questions: [
        "When your clients succeed with your solution, how do they get recognized internally? What makes them the hero?",
        "What career advancement or industry recognition do your successful clients typically achieve?"
      ]
    },
    {
      title: "Emotional & Hidden Pain Extraction",
      questions: [
        "Describe a typical stressful day for your ideal client dealing with the problem you solve.",
        "What keeps your ideal clients up at night about this type of decision?",
        "What career fears do they have about making the wrong choice? What happens if it fails?"
      ]
    },
    {
      title: "Urgency & Pressure Points",
      questions: [
        "What external pressures (competitors, regulations, leadership) create urgency for them to act?",
        "How quickly do they need to show results to maintain internal support?"
      ]
    },
    {
      title: "Buying Psychology",
      questions: [
        "What proof or validation do they need before they'll stake their reputation on a solution?",
        "Walk me through how they typically discover and evaluate solutions - who's involved?"
      ]
    },
    {
      title: "Effort & Sacrifice Barriers",
      questions: [
        "What's the most frustrating part of their current approach? What makes change feel overwhelming?",
        "What internal resistance do they face when proposing solutions like yours?"
      ]
    },
    {
      title: "About Your Business",
      questions: [
        "What success stories do you have? What's the common theme between them?",
        "What are customers saying about you that they don't say about competitors?"
      ]
    }
  ];

  // Flatten all questions with section info
  const allQuestions = sections.flatMap((section, sectionIndex) =>
    section.questions.map((question, questionIndex) => ({
      sectionIndex,
      questionIndex,
      sectionTitle: section.title,
      question,
      id: `${sectionIndex}-${questionIndex}`,
      globalIndex: sections.slice(0, sectionIndex).reduce((acc, s) => acc + s.questions.length, 0) + questionIndex
    }))
  );

  const currentQuestion = allQuestions[currentQuestionIndex];
  const currentSection = currentQuestion ? currentQuestion.sectionIndex : 0;
  const totalQuestions = allQuestions.length;

  const handleResponseChange = (value) => {
    if (currentQuestion) {
      setResponses(prev => ({
        ...prev,
        [currentQuestion.id]: value
      }));
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  };

  const formatResponsesAsTranscript = () => {
    let transcript = "USP-Focused Discovery Call Transcript\n\n";
    
    sections.forEach((section, sectionIndex) => {
      transcript += `=== ${section.title} ===\n\n`;
      
      section.questions.forEach((question, questionIndex) => {
        const questionId = `${sectionIndex}-${questionIndex}`;
        const response = responses[questionId] || '[No response provided]';
        transcript += `Q: ${question}\nA: ${response}\n\n`;
      });
    });
    
    return transcript;
  };

  const fetchLatestPrompt = async () => {
    try {
      console.log('Fetching latest prompt from GitHub...');
      const response = await fetch('https://raw.githubusercontent.com/AlexTMDA/clue-prompts/main/clue-review-prompt.txt');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch prompt: ${response.status} ${response.statusText}`);
      }
      
      const prompt = await response.text();
      console.log('Prompt fetched successfully, length:', prompt.length);
      return prompt;
    } catch (error) {
      console.error('Error fetching prompt:', error);
      throw new Error(`Failed to fetch prompt: ${error.message}`);
    }
  };

  const callClaudeAPI = async (prompt, transcript) => {
    try {
      console.log('Calling Netlify function...');
      console.log('Function URL: /.netlify/functions/generate-clue-report');
      
      const response = await fetch('/.netlify/functions/generate-clue-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          transcript: transcript
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Function response error:', errorText);
        throw new Error(`Function failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Function response received, report length:', data.report?.length || 0);
      
      if (!data.report) {
        throw new Error('No report content in response');
      }

      return data.report;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  const generateUSPReport = async () => {
    setIsGenerating(true);
    setError('');
    setReport('');

    try {
      console.log('Starting USP report generation...');
      
      // Check if we have responses
      const responseCount = Object.keys(responses).length;
      console.log(`Found ${responseCount} responses out of ${totalQuestions} questions`);
      
      if (responseCount === 0) {
        throw new Error('No responses provided. Please answer at least some questions.');
      }

      // Format the transcript
      const transcript = formatResponsesAsTranscript();
      console.log('Transcript formatted, length:', transcript.length);

      // Fetch the latest prompt
      console.log('Fetching prompt...');
      const prompt = await fetchLatestPrompt();

      // Generate the report
      console.log('Generating USP report...');
      const generatedReport = await callClaudeAPI(prompt, transcript);

      console.log('USP report generated successfully!');
      setReport(generatedReport);

    } catch (error) {
      console.error('USP report generation failed:', error);
      setError(`Failed to generate USP report: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usp-analysis-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Get progress within current section
  const questionsBeforeSection = sections.slice(0, currentSection).reduce((acc, s) => acc + s.questions.length, 0);
  const questionInSection = currentQuestionIndex - questionsBeforeSection + 1;
  const questionsInCurrentSection = sections[currentSection]?.questions.length || 1;

  if (report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Your USP Analysis Report
              </h1>
              <p className="text-gray-600">
                Your strategic USP analysis using the Value Equation framework is ready!
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {report}
              </pre>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={downloadReport}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Download USP Report
              </button>
              <button
                onClick={() => {
                  setReport('');
                  setCurrentQuestionIndex(0);
                  setResponses({});
                  setError('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start New Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentQuestionIndex >= totalQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                USP Analysis Complete!
              </h1>
              <p className="text-gray-600 mb-6">
                You've answered all {totalQuestions} strategic questions. Ready to generate your USP analysis?
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  <strong>Responses completed:</strong> {Object.keys(responses).length} of {totalQuestions} questions
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 font-medium">Error:</p>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={generateUSPReport}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors"
              >
                {isGenerating ? 'Generating USP Analysis...' : 'Generate USP Analysis'}
              </button>
              <button
                onClick={() => setCurrentQuestionIndex(totalQuestions - 1)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-lg font-medium transition-colors"
              >
                Back to Last Question
              </button>
            </div>

            {isGenerating && (
              <div className="mt-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-gray-600">
                  Analyzing your responses using the Value Equation framework...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span>{sections[currentSection]?.title} ({questionInSection}/{questionsInCurrentSection})</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentQuestion?.sectionTitle}
              </h2>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {questionInSection} of {questionsInCurrentSection}
              </div>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              {currentQuestion?.question}
            </p>
          </div>

          <textarea
            value={responses[currentQuestion?.id] || ''}
            onChange={(e) => handleResponseChange(e.target.value)}
            placeholder="Please provide your detailed response here..."
            className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />

          <div className="flex justify-between mt-6">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Previous
            </button>
            
            <button
              onClick={nextQuestion}
              disabled={currentQuestionIndex >= totalQuestions - 1}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {currentQuestionIndex === totalQuestions - 1 ? 'Complete Analysis' : 'Next Question'}
            </button>
          </div>

          {/* Quick Navigation */}
          {currentQuestionIndex === totalQuestions - 1 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setCurrentQuestionIndex(totalQuestions)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors"
              >
                Complete & Generate USP Analysis
              </button>
            </div>
          )}
        </div>

        {/* Section Navigation Dots */}
        <div className="mt-6 flex justify-center space-x-2">
          {sections.map((section, sectionIndex) => {
            const sectionStartIndex = sections.slice(0, sectionIndex).reduce((acc, s) => acc + s.questions.length, 0);
            const sectionEndIndex = sectionStartIndex + section.questions.length - 1;
            const isCurrentSection = currentQuestionIndex >= sectionStartIndex && currentQuestionIndex <= sectionEndIndex;
            const isCompleted = currentQuestionIndex > sectionEndIndex;
            
            return (
              <button
                key={sectionIndex}
                onClick={() => goToQuestion(sectionStartIndex)}
                className={`w-4 h-4 rounded-full transition-colors ${
                  isCurrentSection 
                    ? 'bg-indigo-600' 
                    : isCompleted 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                }`}
                title={section.title}
              />
            );
          })}
        </div>

        {/* Response Counter */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <span className="bg-white px-3 py-1 rounded-full shadow">
            {Object.keys(responses).length} of {totalQuestions} questions answered
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;