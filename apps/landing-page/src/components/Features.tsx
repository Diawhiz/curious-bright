import React from 'react';
import { Edit3, PenTool, MessageSquare, ArrowRight } from 'lucide-react';
import { colors } from '@curious-bright/ui-kit';

const featureList = [
  {
    noteTag: 'NOTE 01',
    author: 'AMARA // LIVE WRITING',
    color: colors.coral,
    bgColor: 'rgba(255, 90, 54, 0.08)',
    borderColor: 'rgba(255, 90, 54, 0.3)',
    title: 'Everyone sees changes instantly',
    description: 'Write essays, research papers, and study guides together in real time. No constant refreshing, no lost edits, and no emailing different file versions back and forth.',
    actionText: 'Start Co-Writing →',
    actionUrl: '/register',
    icon: Edit3,
  },
  {
    noteTag: 'NOTE 02',
    author: 'DR. CHEN // MATH & DIAGRAMS',
    color: colors.teal,
    bgColor: 'rgba(0, 168, 150, 0.08)',
    borderColor: 'rgba(0, 168, 150, 0.3)',
    title: 'Shared Whiteboard & Math Canvas',
    description: 'Draw diagrams, type math formulas, and solve science problems together on a shared digital chalkboard that everyone in your group can see and edit live.',
    actionText: 'Try Shared Whiteboard →',
    actionUrl: '/browse',
    icon: PenTool,
  },
  {
    noteTag: 'NOTE 03',
    author: 'PROF. THORNE // PEER REVIEWS',
    color: colors.mustard,
    bgColor: 'rgba(244, 180, 61, 0.12)',
    borderColor: 'rgba(244, 180, 61, 0.4)',
    title: 'Friendly Peer Feedback',
    description: 'Leave margin notes, ask questions, and suggest edits right next to specific sentences or paragraphs. Get helpful feedback from classmates, teachers, and mentors.',
    actionText: 'Explore Peer Reviews →',
    actionUrl: '/community',
    icon: MessageSquare,
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-transparent via-white/50 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-14 space-y-2">
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-coral)]">
            WHAT YOU CAN DO TOGETHER
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-[var(--color-ink)]">
            Built for the speed of live thought.
          </h2>
          <p className="text-[var(--color-faded-ink)] max-w-xl text-base">
            Every feature is crafted to remove friction between collaborators, from shared math whiteboards to inline marginalia.
          </p>
        </div>

        {/* 3 Comment Corner Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featureList.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index} 
                className="comment-corner-card bg-white flex flex-col justify-between p-7 hover:-translate-y-1 transition-all group"
              >
                <div className="comment-corner-ear" title="Peel note corner" />
                
                <div className="space-y-4">
                  {/* Note Label & Author Tag */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[var(--color-faded-ink)] bg-[#F7F6F2] px-2 py-0.5 rounded-sm">
                      {item.noteTag}
                    </span>
                    <span 
                      className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-sm border"
                      style={{ color: item.color, backgroundColor: item.bgColor, borderColor: item.borderColor }}
                    >
                      {item.author}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="space-y-2 pt-2">
                    <div 
                      className="w-10 h-10 rounded-sm flex items-center justify-center mb-3"
                      style={{ backgroundColor: item.bgColor }}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <h3 className="font-display font-bold text-xl text-[var(--color-ink)] group-hover:text-[var(--color-coral)] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--color-faded-ink)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Action Link */}
                <div className="pt-6 border-t border-[var(--color-line)] mt-6">
                  <a 
                    href={item.actionUrl}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                    style={{ color: item.color }}
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
