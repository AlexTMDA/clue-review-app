import React, { useState } from 'react';
import { Search, FileText, TrendingUp, Users, Clock, Brain, Shield, Target, CheckCircle, Download, ArrowRight, ArrowLeft, Eye } from 'lucide-react';

const App = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');

  const sections = [
    {
      title: "Current Positioning",
      icon: Target,
      color: "orange-600",
      questions: [
        "What is your current value positioning and key message?"
      ]
    },
    {
      title: "ICP Foundation", 
      icon: Users,
      color: "teal-600",
      questions: [
        "How would you describe your ideal customer (ICP) - company size, role, industry?",
        "What are your average deal sizes and current goals for the next 12-24 months?"
      ]
    },
    {
      title: "Dream Outcome & Status Elevation",
      icon: TrendingUp,
      color: "yellow-600",
      questions: [
        "When your clients succeed with your solution, how do they get recognized internally? What makes them the hero?",
        "What career advancement or industry recognition do your successful clients typically achieve?"
      ]
    },
    {
      title: "Emotional & Hidden Pain Extraction",
      icon: Brain,
      color: "orange-600",
      questions: [
        "Describe a typical stressful day for your ideal client dealing with the problem you solve.",
        "What keeps your ideal clients up at night about this type of decision?",
        "What career fears do they have about making the wrong choice? What happens if it fails?"
      ]
    },
    {
      title: "Urgency & Pressure Points",
      icon: Clock,
      color: "red-600",
      questions: [
        "What external pressures (competitors, regulations, leadership) create urgency for them to act?",
        "How quickly do they need to show results to maintain internal support?"
      ]
    },
    {
      title: "Buying Psychology",
      icon: Eye,
      color: "teal-600",
      questions: [
        "What proof or validation do they need before they'll stake their reputation on a solution?",
        "Walk me through how they typically discover and evaluate solutions - who's involved?"
      ]
    },
    {
      title: "Effort & Sacrifice Barriers",
      icon: Shield,
      color: "yellow-600",
      questions: [
        "What's the most frustrating part of their current approach? What makes change feel overwhelming?",
        "What internal resistance do they face when proposing solutions like yours?"
      ]
    },
    {
      title: "About Your Business",
      icon: FileText,
      color: "teal-600",
      questions: [
        "What success stories do you have? What's the common theme between them?",
        "What are customers saying about you that they don't say about competitors?"
      ]
    }
  ];

  const getPlaceholderText = (questionText) => {
    // No placeholder for the first question about current value positioning
    if (questionText === "What is your current value positioning and key message?") {
      return "";
    }
    
    // Specific placeholders for each question to help guide responses
    const placeholders = {
      "How would you describe your ideal customer (ICP) - company size, role, industry?": "Example: Mid-market logistics companies (500-2000 employees), with VP Operations or Chief Supply Chain Officer, in retail/manufacturing, managing complex multi-site operations with 50+ trucks/warehouses...",
      
      "What are your average deal sizes and current goals for the next 12-24 months?": "Example: Current average deal: £75K annually, goal to reach £150K+ deals. Targeting 15-20 new enterprise clients next 12 months, aiming for £3M ARR by end of 2025...",
      
      "When your clients succeed with your solution, how do they get recognized internally? What makes them the hero?": "Example: They become the person who reduced logistics costs by 25%, get promoted to Director level, receive company-wide recognition for digital transformation, become the go-to expert for supply chain optimization...",
      
      "What career advancement or industry recognition do your successful clients typically achieve?": "Example: Promoted to VP Supply Chain within 18 months, featured in logistics industry publications, invited to speak at conferences, become thought leaders in their companies...",
      
      "Describe a typical stressful day for your ideal client dealing with the problem you solve.": "Example: Managing crisis calls about delayed shipments, explaining cost overruns to the CFO, dealing with frustrated customers, working late to manually coordinate logistics, feeling overwhelmed by outdated systems...",
      
      "What keeps your ideal clients up at night about this type of decision?": "Example: Fear of choosing wrong technology and damaging their reputation, worry about implementation disrupting operations, concern about ROI not materializing, anxiety about team resistance to change...",
      
      "What career fears do they have about making the wrong choice? What happens if it fails?": "Example: Could lose credibility with senior leadership, might face demotion or job loss, fear of being blamed for wasted budget, worry about being passed over for future projects...",
      
      "What external pressures (competitors, regulations, leadership) create urgency for them to act?": "Example: CEO mandating 20% cost reduction, competitors gaining market advantage through technology, new regulations requiring better tracking, board pressure for digital transformation...",
      
      "How quickly do they need to show results to maintain internal support?": "Example: Need to show quick wins within 60 days, demonstrate ROI within 6 months, prove concept before annual budget reviews, show progress to maintain project funding...",
      
      "What proof or validation do they need before they'll stake their reputation on a solution?": "Example: Case studies from similar companies, pilot program results, references from trusted peers, industry analyst reports, guarantee or risk-sharing arrangements...",
      
      "Walk me through how they typically discover and evaluate solutions - who's involved?": "Example: Operations team identifies need, IT evaluates technical requirements, Finance reviews costs, senior leadership makes final decision. Process takes 6-18 months with multiple stakeholders...",
      
      "What's the most frustrating part of their current approach? What makes change feel overwhelming?": "Example: Manual processes taking hours daily, lack of real-time visibility, multiple disconnected systems, extensive training requirements, fear of disrupting current operations...",
      
      "What internal resistance do they face when proposing solutions like yours?": "Example: 'We've always done it this way' mentality, IT concerns about integration complexity, finance questioning ROI, operations worried about disruption, senior management risk aversion...",
      
      "What success stories do you have? What's the common theme between them?": "Example: Company A reduced costs 30% and gained real-time visibility, Company B improved delivery times 40%, common theme is rapid ROI and operational transformation within 6 months...",
      
      "What are customers saying about you that they don't say about competitors?": "Example: 'Unlike other vendors, they actually understand our industry challenges', 'Implementation was surprisingly smooth', 'Best support team we've worked with', 'Only solution that integrated with our existing systems'..."
    };
    
    return placeholders[questionText] || "Please provide detailed information to help us create the most valuable analysis for your business...";
  };

  // Flatten all questions with section info
  const allQuestions = sections.flatMap((section, sectionIndex) =>
    section.questions.map((question, questionIndex) => ({
      sectionIndex,
      questionIndex,
      sectionTitle: section.title,
      sectionIcon: section.icon,
      sectionColor: section.color,
      question,
      id: `${sectionIndex}-${questionIndex}`,
      globalIndex: sections.slice(0, sectionIndex).reduce((acc, s) => acc + s.questions.length, 0) + questionIndex
    }))
  );

  const currentQuestion = allQuestions[currentQuestionIndex];
  const currentSection = currentQuestion ? currentQuestion.sectionIndex : 0;
  const totalQuestions = allQuestions.length;

  const getCurrentResponseLength = () => {
    return responses[currentQuestion?.id]?.length || 0;
  };

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
      console.log('Calling Vercel API function...');
      console.log('Function URL: /api/generate-clue-report');
      
      const response = await fetch('/api/generate-clue-report', {
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
      console.log('Starting comprehensive USP report generation...');
      
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
      console.log('Fetching enhanced Value Equation prompt...');
      const prompt = await fetchLatestPrompt();

      // Generate the report
      console.log('Generating comprehensive USP analysis using Claude Sonnet 4...');
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
    a.download = 'value-equation-usp-analysis.txt';
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

  const currentLength = getCurrentResponseLength();

  // Report Results Screen
  if (report) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div style={{ backgroundColor: '#264653' }} className="text-white">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-8 h-8 text-orange-400" />
              <h1 className="text-2xl font-bold">The Marketing Detective Agency</h1>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">CLUE Investigation Complete</h2>
            <p className="text-gray-300 text-lg">Your strategic intelligence report is ready for analysis</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Success Message */}
          <div className="bg-teal-50 border-l-4 border-teal-500 p-6 mb-8 rounded-r-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-teal-600" />
              <div>
                <h3 className="text-lg font-semibold text-teal-800">Strategic Analysis Complete</h3>
                <p className="text-teal-700">Comprehensive Value Equation framework analysis using Alex Hormozi's proven methodology</p>
              </div>
            </div>
          </div>

          {/* Report Display */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Strategic Findings & Revenue Directive</h3>
                <div className="text-sm text-gray-600">
                  Generated using Claude Sonnet 4 • {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto border">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-mono">
                  {report}
                </pre>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={downloadReport}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Strategic Report
            </button>
            <button
              onClick={() => {
                setReport('');
                setCurrentQuestionIndex(0);
                setResponses({});
                setError('');
              }}
              className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-300 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Start New Investigation
            </button>
          </div>

          {/* Value Message */}
          <div className="mt-12 text-center">
            <div className="bg-orange-50 rounded-xl p-8 border border-orange-200">
              <h4 className="text-2xl font-bold text-gray-800 mb-4">Ready to Implement These Insights?</h4>
              <p className="text-gray-700 text-lg mb-4">
                This strategic analysis reveals the exact framework to transform your client acquisition approach.
              </p>
              <p className="text-orange-600 font-semibold">
                Contact The Marketing Detective Agency to discuss implementation partnership opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Review & Generate Screen
  if (currentQuestionIndex >= totalQuestions) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div style={{ backgroundColor: '#264653' }} className="text-white">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-8 h-8 text-orange-400" />
              <h1 className="text-2xl font-bold">The Marketing Detective Agency</h1>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Evidence Collection Complete</h2>
            <p className="text-gray-300 text-lg">Ready to analyze your strategic intelligence</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Completion Summary */}
          <div className="bg-teal-50 rounded-xl p-8 mb-8 border border-teal-200">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-teal-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-teal-800 mb-4">Investigation Ready for Analysis</h3>
              <p className="text-teal-700 text-lg mb-6">
                You've provided comprehensive responses to all {totalQuestions} strategic questions. 
                Our Value Equation framework analysis will reveal critical insights for your business growth.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-teal-600">{Object.keys(responses).length}</div>
                  <div className="text-sm text-gray-600">Questions Answered</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-orange-600">~{Math.round(Object.values(responses).join('').length / 1000)}K</div>
                  <div className="text-sm text-gray-600">Characters Provided</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-yellow-600">£1,500</div>
                  <div className="text-sm text-gray-600">Analysis Value</div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded-r-lg">
              <div className="flex items-center gap-3">
                <div className="text-red-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800">Analysis Error</h4>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={generateUSPReport}
              disabled={isGenerating}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-12 py-6 rounded-xl font-bold text-xl transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center gap-3 mx-auto"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Generating Strategic Analysis...
                </>
              ) : (
                <>
                  <FileText className="w-6 h-6" />
                  Generate CLUE Analysis
                </>
              )}
            </button>

            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={() => setCurrentQuestionIndex(totalQuestions - 1)}
                className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow border border-gray-300 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Review Last Question
              </button>
            </div>

            {isGenerating && (
              <div className="mt-8 bg-gray-50 rounded-xl p-6">
                <div className="text-center">
                  <div className="text-gray-700 font-semibold mb-2">
                    Analyzing Strategic Intelligence...
                  </div>
                  <p className="text-gray-600 text-sm">
                    Claude Sonnet 4 is processing your responses using Alex Hormozi's complete Value Equation framework
                  </p>
                  <div className="mt-4 text-xs text-gray-500">
                    Generating comprehensive USP analysis • Expected completion: 15-30 seconds
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Question Interface
  const IconComponent = currentQuestion?.sectionIcon || Target;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div style={{ backgroundColor: '#264653' }} className="text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-8 h-8 text-orange-400" />
            <h1 className="text-2xl font-bold">The Marketing Detective Agency</h1>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Value Proposition Generator</h2>
              <p className="text-gray-300">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">{sections[currentSection]?.title}</div>
              <div className="text-xs text-gray-400">{questionInSection} of {questionsInCurrentSection} in section</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-6xl mx-auto px-6 pb-6">
          <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-orange-500 h-2 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Section Progress Indicators */}
        <div className="flex justify-center space-x-3 mb-8">
          {sections.map((section, sectionIndex) => {
            const sectionStartIndex = sections.slice(0, sectionIndex).reduce((acc, s) => acc + s.questions.length, 0);
            const sectionEndIndex = sectionStartIndex + section.questions.length - 1;
            const isCurrentSection = currentQuestionIndex >= sectionStartIndex && currentQuestionIndex <= sectionEndIndex;
            const isCompleted = currentQuestionIndex > sectionEndIndex;
            const SectionIcon = section.icon;
            
            return (
              <button
                key={sectionIndex}
                onClick={() => goToQuestion(sectionStartIndex)}
                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
                  isCurrentSection 
                    ? 'bg-orange-100 border-2 border-orange-500 shadow-md' 
                    : isCompleted 
                      ? 'bg-teal-100 border-2 border-teal-500 shadow-sm hover:shadow-md' 
                      : 'bg-gray-100 border-2 border-gray-300 hover:bg-gray-200'
                }`}
                title={section.title}
              >
                <SectionIcon className={`w-5 h-5 mb-1 ${
                  isCurrentSection 
                    ? 'text-orange-600' 
                    : isCompleted 
                      ? 'text-teal-600' 
                      : 'text-gray-500'
                }`} />
                <div className={`w-2 h-2 rounded-full ${
                  isCurrentSection 
                    ? 'bg-orange-500' 
                    : isCompleted 
                      ? 'bg-teal-500' 
                      : 'bg-gray-400'
                }`} />
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Section Header */}
          <div className="bg-orange-600 p-6">
            <div className="flex items-center gap-4 text-white">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{currentQuestion?.sectionTitle}</h3>
                <p className="text-white text-opacity-90">Section {currentSection + 1} • Question {questionInSection} of {questionsInCurrentSection}</p>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-8">
            <div className="mb-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-4 leading-relaxed">
                {currentQuestion?.question}
              </h4>
            </div>

            <div className="relative">
              <textarea
                value={responses[currentQuestion?.id] || ''}
                onChange={(e) => handleResponseChange(e.target.value)}
                placeholder={getPlaceholderText(currentQuestion?.question)}
                className="w-full h-48 p-6 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-700 leading-relaxed"
              />
              
              {/* Character Counter */}
              <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 text-xs text-gray-500 px-3 py-1 rounded-full border">
                {currentLength.toLocaleString()} characters
              </div>
            </div>

            {/* Guidance */}
            <div className="mt-4 flex items-center gap-2 text-sm text-teal-700 bg-teal-50 p-3 rounded-lg">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span><strong>Detective Tip:</strong> Please be detailed so that we can provide you with the maximum value possible.</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-gray-50 px-8 py-6 flex justify-between items-center border-t border-gray-200">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow border border-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">
                {Object.keys(responses).length} of {totalQuestions} completed
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: totalQuestions }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      responses[allQuestions[i]?.id] ? 'bg-teal-500' : 
                      i === currentQuestionIndex ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <button
              onClick={nextQuestion}
              disabled={currentQuestionIndex >= totalQuestions - 1}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg disabled:shadow-none flex items-center gap-2"
            >
              {currentQuestionIndex === totalQuestions - 1 ? 'Complete Investigation' : 'Next Question'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Complete Option */}
          {currentQuestionIndex === totalQuestions - 1 && (
            <div className="bg-yellow-50 p-6 border-t border-gray-200">
              <div className="text-center">
                <h5 className="text-lg font-semibold text-gray-800 mb-2">Ready to Generate Your Strategic Analysis?</h5>
                <p className="text-gray-600 mb-4">
                  Complete the investigation and receive your comprehensive Value Equation framework analysis.
                </p>
                <button
                  onClick={() => setCurrentQuestionIndex(totalQuestions)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                >
                  <FileText className="w-5 h-5" />
                  Generate CLUE Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;