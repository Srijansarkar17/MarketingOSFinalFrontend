import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Eye, ExternalLink, X, RefreshCw, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Ad {
  id: number;
  search_keyword: string;
  company: string;
  page_name: string;
  ad_text: string;
  ad_title: string;
  call_to_action: string;
  full_ad_text: string;
  publisher_platform: string;
  display_format: string;
  link_url: string;
  image_count: number;
  video_count: number;
  is_active: boolean;
  total_active_time: number;
  analysis: {
    scores: {
      total_score: number;
      cta_score: number;
      visual_score: number;
      value_proposition_score: number;
      text_quality_score: number;
    };
    value_proposition: {
      benefits: string[];
      urgency: boolean;
    };
    media_analysis: Array<{
      media_type: string;
      file: string;
      colors: string[];
      mood: string;
      mood_score: number;
      pacing?: {
        scene_count: number;
        avg_scene_duration: number;
        hook_speed_sec: number;
        pacing_score: number;
        duration_sec: number;
      };
    }>;
  };
}

const VideoAnalysis: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState('all');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'active_time'>('score');

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('facebook_ads')
        .select('*');

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreGradient = (score: number): string => {
    if (score >= 80) return 'from-emerald-500/20 to-emerald-500/5';
    if (score >= 60) return 'from-amber-500/20 to-amber-500/5';
    return 'from-rose-500/20 to-rose-500/5';
  };

  const filteredAds = ads
    .filter((ad) => {
      const matchesSearch =
        ad.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.ad_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.ad_text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesKeyword =
        selectedKeyword === 'all' || ad.search_keyword === selectedKeyword;
      return matchesSearch && matchesKeyword;
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return (b.analysis?.scores?.total_score || 0) - (a.analysis?.scores?.total_score || 0);
      }
      return b.total_active_time - a.total_active_time;
    });

  const keywords = ['all', ...Array.from(new Set(ads.map((ad) => ad.search_keyword)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl shadow-lg shadow-violet-500/20">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                    Video Analysis Dashboard
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    Performance insights & competitive intelligence
                  </p>
                </div>
              </div>
              <button
                onClick={fetchAds}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-violet-500/10 disabled:opacity-50 border border-slate-700"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="font-medium">Refresh</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by company, title, or text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all placeholder:text-slate-500"
                />
              </div>
              <select
                value={selectedKeyword}
                onChange={(e) => setSelectedKeyword(e.target.value)}
                className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all appearance-none cursor-pointer min-w-[200px]"
              >
                {keywords.map((keyword) => (
                  <option key={keyword} value={keyword}>
                    {keyword === 'all' ? 'All Keywords' : keyword}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'active_time')}
                className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all appearance-none cursor-pointer min-w-[180px]"
              >
                <option value="score">Sort by Score</option>
                <option value="active_time">Sort by Active Time</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              <p className="text-slate-400">Loading advertisements...</p>
            </div>
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-slate-400 text-lg">No ads found matching your criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedKeyword('all');
                }}
                className="mt-4 text-violet-400 hover:text-violet-300 transition-colors"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} onClick={() => setSelectedAd(ad)} />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedAd && (
        <AdDetailModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
      )}
    </div>
  );
};

// Ad Card Component
const AdCard: React.FC<{ ad: Ad; onClick: () => void }> = ({ ad, onClick }) => {
  const scores = ad.analysis?.scores || {
    total_score: 0,
    cta_score: 0,
    visual_score: 0,
    value_proposition_score: 0,
    text_quality_score: 0,
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreGradient = (score: number): string => {
    if (score >= 80) return 'from-emerald-500/20 to-emerald-500/5';
    if (score >= 60) return 'from-amber-500/20 to-amber-500/5';
    return 'from-rose-500/20 to-rose-500/5';
  };

  const scoreMetrics = [
    { label: 'Visual', value: scores.visual_score, color: 'violet' },
    { label: 'CTA', value: scores.cta_score, color: 'fuchsia' },
    { label: 'Value', value: scores.value_proposition_score, color: 'pink' },
    { label: 'Text', value: scores.text_quality_score, color: 'rose' },
  ];

  return (
    <div
      onClick={onClick}
      className="group relative bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-violet-500/50 transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-2xl hover:shadow-violet-500/10 transform hover:-translate-y-1"
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getScoreGradient(scores.total_score)} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
              {ad.company}
            </h3>
            <span className="inline-block px-3 py-1 bg-violet-500/20 text-violet-300 text-xs font-medium rounded-full border border-violet-500/30">
              {ad.search_keyword}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`text-3xl font-bold ${getScoreColor(scores.total_score)}`}>
              {scores.total_score}
            </div>
            <div className="text-xs text-slate-500">Total Score</div>
          </div>
        </div>

        {/* Ad Title & Text */}
        <div className="mb-4 space-y-2">
          <h4 className="font-semibold text-slate-200 line-clamp-2">{ad.ad_title}</h4>
          <p className="text-sm text-slate-400 line-clamp-3">{ad.ad_text}</p>
        </div>

        {/* Score Graph - Horizontal Bars */}
        <div className="space-y-3 mb-4">
          {scoreMetrics.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{metric.label}</span>
                <span className={`font-bold ${getScoreColor(metric.value)}`}>
                  {metric.value}
                </span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-400 transition-all duration-500 rounded-full shadow-lg shadow-${metric.color}-500/20`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {ad.publisher_platform}
            </span>
            <span>
              {ad.image_count > 0 && `${ad.image_count} imgs`}
              {ad.image_count > 0 && ad.video_count > 0 && ' • '}
              {ad.video_count > 0 && `${ad.video_count} vids`}
            </span>
          </div>
          {ad.call_to_action && (
            <span className="px-2 py-1 bg-fuchsia-500/20 text-fuchsia-300 text-xs font-medium rounded border border-fuchsia-500/30">
              {ad.call_to_action}
            </span>
          )}
        </div>
      </div>

      {/* Click indicator */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Eye className="w-5 h-5 text-violet-400" />
      </div>
    </div>
  );
};

// Ad Detail Modal Component
const AdDetailModal: React.FC<{ ad: Ad; onClose: () => void }> = ({ ad, onClose }) => {
  const scores = ad.analysis?.scores || {
    total_score: 0,
    cta_score: 0,
    visual_score: 0,
    value_proposition_score: 0,
    text_quality_score: 0,
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getBarColor = (score: number): string => {
    if (score >= 80) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    if (score >= 60) return 'bg-gradient-to-r from-amber-500 to-amber-400';
    return 'bg-gradient-to-r from-rose-500 to-rose-400';
  };

  const scoreMetrics = [
    { label: 'Visual Score', value: scores.visual_score, icon: '🎨' },
    { label: 'CTA Score', value: scores.cta_score, icon: '👆' },
    { label: 'Value Proposition', value: scores.value_proposition_score, icon: '💎' },
    { label: 'Text Quality', value: scores.text_quality_score, icon: '📝' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-slate-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{ad.company}</h2>
              {ad.is_active && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full border border-emerald-500/30 animate-pulse">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-violet-500/20 text-violet-300 text-xs font-medium rounded-full border border-violet-500/30">
                {ad.search_keyword}
              </span>
              <span className="text-sm text-slate-400">{ad.page_name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-6">
          {/* Total Score - Large Graph */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Overall Performance</h3>
              <div className={`text-5xl font-bold ${getScoreColor(scores.total_score)}`}>
                {scores.total_score}
              </div>
            </div>
            <div className="h-4 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(scores.total_score)} transition-all duration-1000 shadow-lg`}
                style={{ width: `${scores.total_score}%` }}
              />
            </div>
          </div>

          {/* Score Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scoreMetrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{metric.icon}</span>
                    <span className="text-sm font-medium text-slate-300">{metric.label}</span>
                  </div>
                  <span className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
                    {metric.value}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(metric.value)} transition-all duration-700 shadow-lg`}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ad Content */}
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 space-y-4">
            <h3 className="text-lg font-bold text-white">Ad Content</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Title</label>
                <p className="text-white font-medium mt-1">{ad.ad_title}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider">Full Text</label>
                <p className="text-slate-300 mt-1 leading-relaxed">{ad.full_ad_text}</p>
              </div>
            </div>
          </div>

          {/* Value Proposition */}
          {ad.analysis?.value_proposition && (
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Value Proposition</h3>
                {ad.analysis.value_proposition.urgency && (
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs font-medium rounded-full border border-orange-500/30">
                    ⚡ Urgency Detected
                  </span>
                )}
              </div>
              {ad.analysis.value_proposition.benefits && ad.analysis.value_proposition.benefits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ad.analysis.value_proposition.benefits.map((benefit, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-2 bg-violet-500/10 text-violet-300 text-sm rounded-lg border border-violet-500/20"
                    >
                      ✓ {benefit}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Media Analysis */}
          {ad.analysis?.media_analysis && ad.analysis.media_analysis.length > 0 && (
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 space-y-4">
              <h3 className="text-lg font-bold text-white">Media Analysis</h3>
              <div className="space-y-4">
                {ad.analysis.media_analysis.map((media, idx) => (
                  <div key={idx} className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-300 uppercase">
                        {media.media_type}
                      </span>
                      <span className={`text-sm font-medium ${getScoreColor(media.mood_score)}`}>
                        Mood: {media.mood} ({media.mood_score})
                      </span>
                    </div>
                    {media.colors && media.colors.length > 0 && (
                      <div>
                        <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">
                          Color Palette
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {media.colors.map((color, colorIdx) => (
                            <div
                              key={colorIdx}
                              className="group relative"
                            >
                              <div
                                className="w-10 h-10 rounded-lg border-2 border-slate-600 shadow-lg transition-transform hover:scale-110"
                                style={{ backgroundColor: color }}
                              />
                              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {color}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {media.pacing && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                          <div className="text-xs text-slate-400">Scenes</div>
                          <div className="text-lg font-bold text-white">{media.pacing.scene_count}</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                          <div className="text-xs text-slate-400">Avg Scene</div>
                          <div className="text-lg font-bold text-white">{media.pacing.avg_scene_duration.toFixed(1)}s</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                          <div className="text-xs text-slate-400">Hook Speed</div>
                          <div className="text-lg font-bold text-white">{media.pacing.hook_speed_sec.toFixed(1)}s</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                          <div className="text-xs text-slate-400">Pacing</div>
                          <div className={`text-lg font-bold ${getScoreColor(media.pacing.pacing_score)}`}>
                            {media.pacing.pacing_score}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform & Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
              <label className="text-xs text-slate-400 uppercase tracking-wider">Platform</label>
              <p className="text-white font-medium mt-1">{ad.publisher_platform}</p>
              <p className="text-sm text-slate-400 mt-1">{ad.display_format}</p>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
              <label className="text-xs text-slate-400 uppercase tracking-wider">Media Count</label>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-white font-medium">{ad.image_count} Images</span>
                <span className="text-white font-medium">{ad.video_count} Videos</span>
              </div>
            </div>
          </div>

          {/* CTA & Link */}
          <div className="flex gap-3">
            {ad.call_to_action && (
              <div className="flex-1 bg-fuchsia-500/10 rounded-xl p-5 border border-fuchsia-500/30">
                <label className="text-xs text-fuchsia-400 uppercase tracking-wider">Call to Action</label>
                <p className="text-white font-medium mt-1">{ad.call_to_action}</p>
              </div>
            )}
            {ad.link_url && (
              <a
                href={ad.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl transition-colors shadow-lg shadow-violet-500/20"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="font-medium">View Ad</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalysis;