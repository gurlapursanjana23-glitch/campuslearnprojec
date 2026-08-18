'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Briefcase, FileText, Bot, Building, Play, Upload, Star, Clock, FileBadge, Code, Target, ChevronRight, Loader2, Search, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { placementAPI } from '@/lib/api';

const TABS = ['dashboard', 'tests', 'interview', 'resume', 'companies'] as const;
type Tab = typeof TABS[number];

export default function PlacementPreparationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeScore, setResumeScore] = useState<number | null>(null);

  // Interview state
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const MOCK_QUESTIONS = [
    "Tell me about a time you had to optimize a slow application.",
    "Explain the difference between SQL and NoSQL databases.",
    "How do you handle merge conflicts in Git?"
  ];

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const analyzeResume = () => {
    if (!resumeFile) return;
    setIsProcessing(true);
    setTimeout(() => {
      setResumeScore(Math.floor(Math.random() * 20) + 75); // Random score 75-95
      setIsProcessing(false);
      toast.success('Resume analyzed successfully!');
    }, 2500);
  };

  return (
    <DashboardLayout requiredRole="student">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Briefcase size={20} className="text-orange-500" />
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Placement Preparation</h1>
          </div>
          <p className="text-sm text-zinc-500">Aptitude, mock interviews, and resume building</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl w-fit">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Target },
          { id: 'tests', label: 'Aptitude & Coding', icon: Code },
          { id: 'interview', label: 'Mock Interview', icon: Bot },
          { id: 'resume', label: 'Resume Analyzer', icon: FileBadge },
          { id: 'companies', label: 'Companies', icon: Building }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
              <Icon size={14} /> {t.label}
            </button>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Aptitude Score', value: '82%', icon: FileText, color: 'text-blue-500' },
                    { label: 'Coding Score', value: '75%', icon: Code, color: 'text-emerald-500' },
                    { label: 'Interview Readiness', value: '60%', icon: Bot, color: 'text-violet-500' },
                    { label: 'Resume Strength', value: resumeScore ? `${resumeScore}%` : 'Not Analyzed', icon: FileBadge, color: 'text-orange-500' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-3 mb-2">
                        <stat.icon size={16} className={stat.color} />
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-black text-zinc-900 dark:text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <h3 className="font-black text-zinc-900 dark:text-white mb-4">Recommended Next Steps</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                      <div>
                        <p className="font-bold text-orange-900 dark:text-orange-100">Take an Aptitude Mock Test</p>
                        <p className="text-sm text-orange-700/80 dark:text-orange-400/80 mt-0.5">Your quantitative aptitude needs practice.</p>
                      </div>
                      <button onClick={() => setActiveTab('tests')} className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg shadow-sm">Start Test</button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">Analyze your Resume</p>
                        <p className="text-sm text-zinc-500 mt-0.5">Upload your latest resume for AI feedback.</p>
                      </div>
                      <button onClick={() => setActiveTab('resume')} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-bold rounded-lg">Upload</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'tests' && (
              <motion.div key="tests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <h3 className="font-black text-zinc-900 dark:text-white mb-5 flex items-center gap-2"><Target size={18} className="text-blue-500" /> Assessment Tests</h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Quantitative Aptitude Test 1', duration: '60 mins', qs: 40, tags: ['Math', 'Logic'], link: 'https://www.indiabix.com/online-test/aptitude-test/' },
                      { title: 'Data Structures & Algorithms', duration: '90 mins', qs: 3, tags: ['Coding', 'Hard'], link: 'https://www.geeksforgeeks.org/explore?page=1&category[]=Data%20Structures' },
                      { title: 'Verbal Ability Mock', duration: '30 mins', qs: 25, tags: ['English'], link: 'https://www.indiabix.com/online-test/verbal-ability-test/' }
                    ].map((test, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-orange-500/50 transition-colors">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white">{test.title}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                            <span className="flex items-center gap-1"><Clock size={12} /> {test.duration}</span>
                            <span className="flex items-center gap-1"><FileText size={12} /> {test.qs} Questions</span>
                          </div>
                          <div className="flex gap-1.5 mt-2">
                            {test.tags.map(t => <span key={t} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 rounded-md">{t}</span>)}
                          </div>
                        </div>
                        <button onClick={() => window.open(test.link, '_blank')} className="flex items-center justify-center w-10 h-10 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition-colors cursor-pointer">
                          <Play size={16} className="ml-1" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'interview' && (
              <motion.div key="interview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                  
                  {!interviewStarted ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-violet-100 dark:bg-violet-500/10 text-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Bot size={32} />
                      </div>
                      <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">AI Mock Interviewer</h3>
                      <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-6">Practice your technical and HR interviews with our AI. Get instant feedback on your answers, tone, and confidence.</p>
                      <button onClick={() => setInterviewStarted(true)} className="px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all flex items-center gap-2 mx-auto">
                        <Play size={18} /> Start Session
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2"><Bot size={18} className="text-violet-500" /> Interview in Progress</h3>
                        <span className="text-xs font-bold text-zinc-400">Question {currentQuestion + 1} of {MOCK_QUESTIONS.length}</span>
                      </div>
                      <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl mb-4 border border-zinc-100 dark:border-zinc-800">
                        <p className="text-lg font-medium text-zinc-900 dark:text-white leading-relaxed">"{MOCK_QUESTIONS[currentQuestion]}"</p>
                      </div>
                      <textarea rows={5} placeholder="Type your answer here..." className="w-full p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:border-violet-500 outline-none text-zinc-900 dark:text-white resize-none mb-4" />
                      <div className="flex justify-end gap-3">
                        <button onClick={() => setInterviewStarted(false)} className="px-4 py-2 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">End Session</button>
                        <button onClick={() => {
                          if (currentQuestion < MOCK_QUESTIONS.length - 1) setCurrentQuestion(prev => prev + 1);
                          else { setInterviewStarted(false); setCurrentQuestion(0); toast.success('Interview completed! Analyzing results...'); }
                        }} className="px-6 py-2 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl transition-colors">
                          {currentQuestion < MOCK_QUESTIONS.length - 1 ? 'Next Question' : 'Submit Interview'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'resume' && (
              <motion.div key="resume" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <h3 className="font-black text-zinc-900 dark:text-white mb-2 flex items-center gap-2"><FileBadge size={18} className="text-orange-500" /> AI Resume Analyzer</h3>
                  <p className="text-sm text-zinc-500 mb-6">Upload your resume to get an ATS score and actionable improvement tips.</p>

                  <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl p-8 text-center hover:border-orange-500/50 transition-colors bg-zinc-50 dark:bg-zinc-800/30">
                    <input type="file" id="resume-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                    <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center mb-3">
                        <Upload size={20} />
                      </div>
                      <span className="font-bold text-zinc-900 dark:text-white mb-1">
                        {resumeFile ? resumeFile.name : 'Click to upload or drag and drop'}
                      </span>
                      <span className="text-xs text-zinc-400">PDF, DOCX (Max. 5MB)</span>
                    </label>
                  </div>

                  {resumeFile && (
                    <div className="mt-4 flex justify-end">
                      <button onClick={analyzeResume} disabled={isProcessing} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60">
                        {isProcessing ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : 'Analyze Resume'}
                      </button>
                    </div>
                  )}

                  {resumeScore && !isProcessing && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-6 mb-6">
                        <div className="relative w-24 h-24 shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" className="text-zinc-100 dark:text-zinc-800" />
                            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray={`${resumeScore * 2.51} 251`} strokeLinecap="round" className="text-emerald-500" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-zinc-900 dark:text-white">{resumeScore}</span>
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">ATS Score</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-white text-lg">Good, but has room for improvement</h4>
                          <p className="text-sm text-zinc-500 mt-1">Your resume passes basic ATS checks but could use stronger action verbs.</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-xl flex items-start gap-3">
                          <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-emerald-900 dark:text-emerald-400 text-sm">Clear formatting</p>
                            <p className="text-xs text-emerald-700/80 dark:text-emerald-500/80 mt-0.5">Your layout is easy for parsers to read.</p>
                          </div>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-xl flex items-start gap-3">
                          <Star size={16} className="text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-amber-900 dark:text-amber-400 text-sm">Quantify your achievements</p>
                            <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-0.5">Add more numbers and metrics to your experience section.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'companies' && (
              <motion.div key="companies" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-zinc-900 dark:text-white flex items-center gap-2"><Building size={18} className="text-orange-500" /> Target Companies</h3>
                    <div className="relative w-48">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input type="text" placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:border-orange-500 outline-none text-zinc-900 dark:text-white" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { name: 'Google', role: 'Software Engineer', ctc: '24-32 LPA', tags: ['DSA', 'System Design'] },
                      { name: 'Microsoft', role: 'SDE 1', ctc: '20-28 LPA', tags: ['DSA', 'CS Fundamentals'] },
                      { name: 'Amazon', role: 'SDE', ctc: '22-30 LPA', tags: ['Leadership Principles', 'DSA'] },
                      { name: 'TCS Digital', role: 'Systems Engineer', ctc: '7-9 LPA', tags: ['Aptitude', 'Coding'] },
                    ].map((c, i) => (
                      <div key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-3 flex items-center justify-center font-black text-zinc-400 text-lg">{c.name[0]}</div>
                        <h4 className="font-bold text-zinc-900 dark:text-white">{c.name}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">{c.role} • {c.ctc}</p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {c.tags.map(t => <span key={t} className="px-2 py-0.5 bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 text-[10px] font-bold rounded-md">{t}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl p-5 text-white shadow-xl">
            <h3 className="font-black text-lg mb-1">Upcoming Drive</h3>
            <p className="text-zinc-400 text-sm mb-4">Infosys • System Engineer</p>
            <div className="flex gap-2">
              <div className="bg-white/10 rounded-lg p-2 flex-1 text-center">
                <span className="block text-xl font-black">12</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Days</span>
              </div>
              <div className="bg-white/10 rounded-lg p-2 flex-1 text-center">
                <span className="block text-xl font-black">04</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Hrs</span>
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-orange-500 hover:bg-orange-600 font-bold rounded-xl text-sm transition-colors shadow-sm">View Details</button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
            <h3 className="font-black text-zinc-900 dark:text-white text-sm mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center shrink-0"><Code size={14} /></div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">Completed DSA Mock</p>
                  <p className="text-xs text-zinc-500">Score: 8/10 • 2 days ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center shrink-0"><FileText size={14} /></div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">Aptitude Test 1</p>
                  <p className="text-xs text-zinc-500">Score: 32/40 • 4 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
