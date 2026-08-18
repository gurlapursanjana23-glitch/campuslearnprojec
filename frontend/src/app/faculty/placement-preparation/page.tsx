'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Briefcase, FileText, Bot, Building, Play, Upload, Star, Clock, FileBadge, Code, Target, ExternalLink, Loader2, Search, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const TABS = ['dashboard', 'tests', 'interview', 'resources'] as const;
type Tab = typeof TABS[number];

export default function FacultyPlacementPrepPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const MOCK_QUESTIONS = [
    "Tell me about a time you had to optimize a slow application.",
    "Explain the difference between SQL and NoSQL databases.",
    "How do you handle merge conflicts in Git?"
  ];

  return (
    <DashboardLayout requiredRole="faculty">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Briefcase size={20} className="text-orange-500" />
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Placement Preparation</h1>
          </div>
          <p className="text-sm text-zinc-500">Aptitude resources, mock tests, and interview tools</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl w-fit">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Target },
          { id: 'tests', label: 'Aptitude Tests', icon: Code },
          { id: 'interview', label: 'Mock Interview (AI)', icon: Bot },
          { id: 'resources', label: 'External Resources', icon: ExternalLink }
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
                    { label: 'Active Mock Tests', value: '12', icon: FileText, color: 'text-blue-500' },
                    { label: 'Aptitude Banks', value: '5+', icon: Code, color: 'text-emerald-500' },
                    { label: 'AI Interviews', value: 'Ready', icon: Bot, color: 'text-violet-500' },
                    { label: 'External Links', value: 'Updated', icon: ExternalLink, color: 'text-orange-500' }
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
                  <h3 className="font-black text-zinc-900 dark:text-white mb-4">Recommended Actions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                      <div>
                        <p className="font-bold text-orange-900 dark:text-orange-100">Browse Aptitude Tests</p>
                        <p className="text-sm text-orange-700/80 dark:text-orange-400/80 mt-0.5">Explore the tests available for your students.</p>
                      </div>
                      <button onClick={() => setActiveTab('tests')} className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg shadow-sm">View Tests</button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">External Preparation Sites</p>
                        <p className="text-sm text-zinc-500 mt-0.5">Share Google/IndiaBix links with students.</p>
                      </div>
                      <button onClick={() => setActiveTab('resources')} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-bold rounded-lg">View Links</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'tests' && (
              <motion.div key="tests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <h3 className="font-black text-zinc-900 dark:text-white mb-5 flex items-center gap-2"><Target size={18} className="text-blue-500" /> Aptitude & Coding Assessments</h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Quantitative Aptitude Test 1', duration: '60 mins', qs: 40, tags: ['Math', 'Logic'] },
                      { title: 'Data Structures & Algorithms', duration: '90 mins', qs: 3, tags: ['Coding', 'Hard'] },
                      { title: 'Verbal Ability Mock', duration: '30 mins', qs: 25, tags: ['English'] }
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
                        <button className="flex items-center justify-center w-10 h-10 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition-colors">
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
                      <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-6">Test the AI Interview module that your students will use. Provide sample answers and see how the AI grades you.</p>
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

            {activeTab === 'resources' && (
              <motion.div key="resources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-zinc-900 dark:text-white flex items-center gap-2"><ExternalLink size={18} className="text-orange-500" /> Best Aptitude Preparation Sites</h3>
                  </div>
                  <div className="grid gap-4">
                    {[
                      { name: 'IndiaBix', desc: 'The most comprehensive site for quantitative aptitude, logical reasoning, and verbal ability tests.', url: 'https://www.indiabix.com/', tags: ['Aptitude', 'Logical', 'Verbal'] },
                      { name: 'GeeksforGeeks', desc: 'Excellent resource for Data Structures, Algorithms, and company-specific coding questions.', url: 'https://www.geeksforgeeks.org/', tags: ['DSA', 'Coding', 'Interview'] },
                      { name: 'LeetCode', desc: 'The industry standard for practicing coding interview questions with an active community.', url: 'https://leetcode.com/', tags: ['Competitive Coding', 'DSA'] },
                      { name: 'InterviewBit', desc: 'Highly structured paths for software engineering interviews, backed by Scaler.', url: 'https://www.interviewbit.com/', tags: ['SDE prep', 'Mock Tests'] },
                      { name: 'Google Interview Warmup', desc: 'Practice key interview questions with Google\'s AI tool that transcribes and analyzes your answers.', url: 'https://grow.google/certificates/interview-warmup/', tags: ['Google AI', 'Mock Interview'] },
                    ].map((site, i) => (
                      <a key={i} href={site.url} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-orange-500/5 transition-all group">
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-white text-lg group-hover:text-orange-500 transition-colors flex items-center gap-2">
                            {site.name} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h4>
                          <p className="text-sm text-zinc-500 mt-1">{site.desc}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {site.tags.map(t => <span key={t} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 rounded-md">{t}</span>)}
                          </div>
                        </div>
                      </a>
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
            <p className="text-zinc-400 text-sm mb-4">Google • Software Engineer</p>
            <div className="flex gap-2">
              <div className="bg-white/10 rounded-lg p-2 flex-1 text-center">
                <span className="block text-xl font-black">08</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Days</span>
              </div>
              <div className="bg-white/10 rounded-lg p-2 flex-1 text-center">
                <span className="block text-xl font-black">12</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Hrs</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
            <h3 className="font-black text-zinc-900 dark:text-white text-sm mb-4">Quick Links</h3>
            <div className="space-y-3">
              <a href="https://www.indiabix.com/aptitude/questions-and-answers/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center shrink-0"><FileText size={14} /></div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">Quantitative Aptitude</p>
                  <p className="text-xs text-zinc-500">Practice questions</p>
                </div>
              </a>
              <a href="https://grow.google/certificates/interview-warmup/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center shrink-0"><Bot size={14} /></div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">Google Interview AI</p>
                  <p className="text-xs text-zinc-500">Warmup exercises</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
