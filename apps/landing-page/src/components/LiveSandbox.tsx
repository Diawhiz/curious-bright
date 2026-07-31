import React, { useState } from 'react';
import { Send, UserCheck, MessageSquare, Sparkles } from 'lucide-react';
import { colors } from '@curious-bright/ui-kit';

interface CommentItem {
  id: number;
  author: string;
  color: string;
  text: string;
  time: string;
}

export const LiveSandbox: React.FC = () => {
  const [sandboxText, setSandboxText] = useState(
    'High school and college study groups can research climate solutions together, co-authoring essays and sharing notes in real time...'
  );

  const [activeCollaborator, setActiveCollaborator] = useState<'Amara' | 'Dr. Chen' | 'Prof. Thorne'>('Amara');
  const [commentInput, setCommentInput] = useState('');

  const [comments, setComments] = useState<CommentItem[]>([
    { id: 1, author: 'Amara', color: colors.coral, text: 'Added statistics on local solar power adoption.', time: '2m ago' },
    { id: 2, author: 'Dr. Chen', color: colors.teal, text: 'Added efficiency formula: E = P × t', time: 'Just now' },
  ]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const getColor = (name: string) => {
      if (name === 'Amara') return colors.coral;
      if (name === 'Dr. Chen') return colors.teal;
      return colors.mustard;
    };

    setComments([
      ...comments,
      {
        id: Date.now(),
        author: activeCollaborator,
        color: getColor(activeCollaborator),
        text: commentInput.trim(),
        time: 'Just now',
      },
    ]);
    setCommentInput('');
  };

  return (
    <section id="sandbox" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="comment-corner-card bg-white p-6 sm:p-10 shadow-lg">
          <div className="comment-corner-ear" title="Peel playground note" />
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--color-line)]">
            <div>
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-coral)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                TRY IT NOW // INTERACTIVE PLAYGROUND
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[var(--color-ink)] mt-1">
                Type an idea & post a margin note live.
              </h2>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#F7F6F2] border border-[var(--color-line)] font-mono text-xs font-bold text-[var(--color-ink)] self-start sm:self-auto">
              <UserCheck className="w-4 h-4 text-[var(--color-teal)]" />
              <span>Study Group Mode</span>
            </div>
          </div>

          {/* Interactive Text Input */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-faded-ink)]">
              Shared Essay / Study Canvas
            </label>
            <textarea
              value={sandboxText}
              onChange={(e) => setSandboxText(e.target.value)}
              rows={4}
              className="w-full bg-[#F7F6F2] border border-[var(--color-line)] rounded-sm p-4 font-body text-base text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] focus:ring-1 focus:ring-[var(--color-ink)] transition-all"
              placeholder="Type your study note or research idea here..."
            />

            {/* Active Collaborator Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[var(--color-faded-ink)] font-medium">
                  Active Collaborator:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveCollaborator('Amara')}
                    className={`px-3 py-1 rounded-sm font-mono text-xs font-semibold transition-all border ${
                      activeCollaborator === 'Amara'
                        ? 'bg-[var(--color-coral)] text-white border-[var(--color-coral)]'
                        : 'bg-[#F7F6F2] text-[var(--color-ink)] border-[var(--color-line)] hover:border-[var(--color-faded-ink)]'
                    }`}
                  >
                    Amara (Coral)
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCollaborator('Dr. Chen')}
                    className={`px-3 py-1 rounded-sm font-mono text-xs font-semibold transition-all border ${
                      activeCollaborator === 'Dr. Chen'
                        ? 'bg-[var(--color-teal)] text-white border-[var(--color-teal)]'
                        : 'bg-[#F7F6F2] text-[var(--color-ink)] border-[var(--color-line)] hover:border-[var(--color-faded-ink)]'
                    }`}
                  >
                    Dr. Chen (Teal)
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCollaborator('Prof. Thorne')}
                    className={`px-3 py-1 rounded-sm font-mono text-xs font-semibold transition-all border ${
                      activeCollaborator === 'Prof. Thorne'
                        ? 'bg-[var(--color-mustard)] text-[var(--color-ink)] border-[var(--color-mustard)]'
                        : 'bg-[#F7F6F2] text-[var(--color-ink)] border-[var(--color-line)] hover:border-[var(--color-faded-ink)]'
                    }`}
                  >
                    Prof. Thorne (Mustard)
                  </button>
                </div>
              </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="flex gap-3 pt-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add a margin comment to this study note..."
                className="flex-1 bg-white border border-[var(--color-line)] rounded-sm px-4 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
              />
              <button type="submit" className="btn-primary text-xs px-5 py-2.5">
                <span>Post Margin Note</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Rendered Live Comments */}
            <div className="space-y-2.5 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--color-faded-ink)] font-semibold uppercase">
                <MessageSquare className="w-3.5 h-3.5 text-[var(--color-teal)]" />
                Live Margin Notes Thread ({comments.length})
              </div>

              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3.5 bg-[#F7F6F2] rounded-r-sm text-sm flex items-start justify-between gap-4 transition-all"
                  style={{ borderLeft: `4px solid ${comment.color}` }}
                >
                  <div className="space-y-1">
                    <span 
                      className="font-mono text-xs font-bold"
                      style={{ color: comment.color }}
                    >
                      {comment.author}:
                    </span>{' '}
                    <span className="text-[var(--color-ink)] font-medium">
                      {comment.text}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-[var(--color-faded-ink)] whitespace-nowrap">
                    {comment.time}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
