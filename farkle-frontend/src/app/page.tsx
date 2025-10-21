'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();
  const [showRules, setShowRules] = React.useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          {/* Animated Dice Logo */}
          <div className="mb-6 flex justify-center">
            <div className="relative group cursor-pointer">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-amber-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              
              {/* Dice Container */}
              <div className="relative bg-gradient-to-br from-purple-600/20 to-amber-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transform group-hover:scale-105 transition-transform duration-300">
                {/* Dice Icon */}
                <div className="w-24 h-24 bg-white/10 rounded-2xl border-2 border-white/20 flex items-center justify-center shadow-2xl">
                  <div className="grid grid-cols-2 gap-3 p-4">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-7xl md:text-8xl font-black mb-4 text-gradient-purple drop-shadow-2xl">
            FARKLE
          </h1>
          
          {/* Subtitle */}
          <p className="text-2xl text-gray-300 font-medium mb-2">
            The Ultimate Dice Game
          </p>
          
          <p className="text-lg text-gray-400">
            Roll • Score • Win
          </p>
        </div>

        {/* Main Menu Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8 animate-bounce-in">
          {/* Multiplayer Card */}
          <div className="glass-card-hover rounded-3xl p-8 group cursor-pointer" onClick={() => router.push('/create')}>
            <div className="text-center space-y-4">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-2xl group-hover:bg-purple-500/30 transition-colors">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white">Multiplayer</h3>
              
              {/* Description */}
              <p className="text-gray-400">
                Challenge friends online in real-time gameplay
              </p>

              {/* Button */}
              <button className="btn-premium w-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Game
              </button>
            </div>
          </div>

          {/* Play vs AI Card */}
          <div className="glass-card-hover rounded-3xl p-8 group cursor-pointer" onClick={() => router.push('/create-ai')}>
            <div className="text-center space-y-4">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-2xl group-hover:bg-amber-500/30 transition-colors">
                <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7H7v6h6V7z" />
                  <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white">Play vs AI</h3>
              
              {/* Description */}
              <p className="text-gray-400">
                Practice against intelligent computer opponent
              </p>

              {/* Button */}
              <button className="btn-premium w-full bg-gradient-to-r from-amber-600 to-amber-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Start AI Game
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Join Game */}
          <button 
            onClick={() => router.push('/join')}
            className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-white">Join Game</div>
                <div className="text-sm text-gray-400">Enter game code</div>
              </div>
            </div>
          </button>

          {/* How to Play */}
          <button 
            onClick={() => setShowRules(true)}
            className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-white">How to Play</div>
                <div className="text-sm text-gray-400">Learn the rules</div>
              </div>
            </div>
          </button>

          {/* Stats/Leaderboard */}
          <button 
            className="glass-card rounded-2xl p-6 hover:bg-white/10 transition-all group opacity-50 cursor-not-allowed"
            disabled
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-gray-400">Leaderboard</div>
                <div className="text-sm text-gray-500">Coming soon</div>
              </div>
            </div>
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-3xl">⚡</div>
            <div className="font-semibold text-white">Fast-Paced</div>
            <div className="text-sm text-gray-400">Quick rounds</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🎲</div>
            <div className="font-semibold text-white">Strategic</div>
            <div className="text-sm text-gray-400">Risk vs reward</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🏆</div>
            <div className="font-semibold text-white">Competitive</div>
            <div className="text-sm text-gray-400">First to 10,000</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Built with Next.js & .NET</p>
        </div>
      </div>

      {/* Rules Modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}

// Rules Modal Component
function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-card rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-bounce-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 glass-card border-b border-white/10 p-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">How to Play</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-gray-300">
          <div>
            <h3 className="text-xl font-bold text-white mb-3">🎯 Objective</h3>
            <p>Be the first player to reach 10,000 points!</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-3">🎲 Scoring</h3>
            <ul className="space-y-2">
              <li>• Single 1 = 100 points</li>
              <li>• Single 5 = 50 points</li>
              <li>• Three 1s = 1,000 points</li>
              <li>• Three 2s = 200 points</li>
              <li>• Three 3s = 300 points</li>
              <li>• Three 4s = 400 points</li>
              <li>• Three 5s = 500 points</li>
              <li>• Three 6s = 600 points</li>
              <li>• Straight (1-2-3-4-5-6) = 1,500 points</li>
              <li>• Three Pairs = 1,500 points</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-3">📖 How to Play</h3>
            <ol className="space-y-2 list-decimal list-inside">
              <li>Roll all 6 dice on your turn</li>
              <li>Set aside scoring dice</li>
              <li>Choose to bank points or roll remaining dice</li>
              <li>If you roll no scoring dice, you &quot;Farkle&quot; and lose turn points</li>
              <li>If all dice score (Hot Dice), roll all 6 again!</li>
              <li>Must score 500+ points to get &quot;on the board&quot;</li>
            </ol>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <p className="text-amber-400 font-semibold">
              ⚠️ Risk vs Reward: Bank early to secure points, or keep rolling to score big!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}