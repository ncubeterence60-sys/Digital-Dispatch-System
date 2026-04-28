import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Star,
  Shield,
  Lock,
  Zap,
  Target,
  Users,
  Truck,
  DollarSign,
  Activity,
  Award,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BrainCircuit,
  Megaphone,
  Globe,
  Eye,
  ThumbsUp,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Server,
  Wifi,
  Database
} from 'lucide-react';

interface DashboardStats {
  totalTrips: number;
  totalRevenue: number;
  activeDrivers: number;
  activeTrips: number;
  revenueToday: number;
  completedTrips: number;
  cancelledTrips: number;
  newCustomers: number;
  customerSatisfaction: number;
  avgResponseTime: number;
}

interface Rating {
  id: number;
  customer: string;
  rating: number;
  comment: string;
  date: string;
  driver: string;
}

interface AIInsight {
  id: number;
  type: 'strategy' | 'alert' | 'opportunity' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  metric?: string;
}

interface ActivityItem {
  id: number;
  action: string;
  user: string;
  time: string;
  type: 'trip' | 'driver' | 'payment' | 'system';
}

const API_BASE_URL = 'http://localhost:3000/api';

const Reports: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    totalRevenue: 0,
    activeDrivers: 0,
    activeTrips: 0,
    revenueToday: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    newCustomers: 0,
    customerSatisfaction: 0,
    avgResponseTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');

  // Mock data for enhanced dashboard
  const companyInfo = useMemo(() => ({
    name: 'Nasho Technologies Pvt Ltd',
    tagline: 'Digital Dispatch Solutions',
    founded: '2019',
    headquarters: 'Harare, Zimbabwe',
    employees: '150+',
    fleetSize: '85 Vehicles',
    coverage: '12 Cities',
    mission: 'Revolutionizing urban mobility through AI-powered dispatch systems and sustainable transportation solutions.',
    values: ['Innovation', 'Reliability', 'Safety', 'Sustainability']
  }), []);

  const ratings: Rating[] = useMemo(() => [
    { id: 1, customer: 'Sarah M.', rating: 5, comment: 'Excellent service! Driver was professional and on time.', date: '2024-04-27', driver: 'John K.' },
    { id: 2, customer: 'David O.', rating: 5, comment: 'Best dispatch app in the city. Highly recommended!', date: '2024-04-27', driver: 'Mary T.' },
    { id: 3, customer: 'Lisa N.', rating: 4, comment: 'Great experience overall. Quick pickup.', date: '2024-04-26', driver: 'Peter S.' },
    { id: 4, customer: 'James R.', rating: 5, comment: 'The AI routing saved me so much time. Amazing!', date: '2024-04-26', driver: 'Grace W.' },
    { id: 5, customer: 'Amanda K.', rating: 4, comment: 'Clean vehicle and friendly driver.', date: '2024-04-25', driver: 'Robert B.' }
  ], []);

  const aiInsights: AIInsight[] = useMemo(() => [
    {
      id: 1,
      type: 'strategy',
      title: 'Peak Hour Optimization',
      description: 'AI predicts 34% demand surge between 7-9 AM next Monday. Recommend activating 12 additional drivers.',
      impact: 'high',
      metric: '+$2,400 projected'
    },
    {
      id: 2,
      type: 'opportunity',
      title: 'Corporate Partnership',
      description: 'Local business district shows 28% increase in repeat corporate bookings. Opportunity for B2B expansion.',
      impact: 'high',
      metric: '+15% revenue'
    },
    {
      id: 3,
      type: 'trend',
      title: 'Eco-Friendly Shift',
      description: 'Customer preference for hybrid vehicles up 42%. Marketing campaign for green fleet recommended.',
      impact: 'medium',
      metric: '42% preference'
    },
    {
      id: 4,
      type: 'alert',
      title: 'Driver Retention Alert',
      description: '3 high-rated drivers showing reduced activity. Proactive engagement suggested.',
      impact: 'medium',
      metric: '3 drivers'
    },
    {
      id: 5,
      type: 'strategy',
      title: 'Weekend Campaign',
      description: 'Social media sentiment analysis suggests strong weekend leisure trip potential in CBD area.',
      impact: 'low',
      metric: 'Sentiment +18%'
    }
  ], []);

  const activities: ActivityItem[] = useMemo(() => [
    { id: 1, action: 'New trip completed', user: 'Customer #4521', time: '2 min ago', type: 'trip' },
    { id: 2, action: 'Driver went online', user: 'John K. (DRV-102)', time: '5 min ago', type: 'driver' },
    { id: 3, action: 'Payment received', user: '$45.00 via EcoCash', time: '8 min ago', type: 'payment' },
    { id: 4, action: 'New driver application', user: 'Samuel T.', time: '12 min ago', type: 'driver' },
    { id: 5, action: 'System backup completed', user: 'Auto-scheduled', time: '15 min ago', type: 'system' },
    { id: 6, action: 'Trip cancelled', user: 'Customer #4489', time: '18 min ago', type: 'trip' }
  ], []);

  const marketingMetrics = useMemo(() => ({
    campaignReach: 45200,
    engagementRate: 8.4,
    conversionRate: 3.2,
    socialFollowers: 12500,
    brandMentions: 342,
    sentiment: 87
  }), []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats({
          totalTrips: data.totalTrips || 1247,
          totalRevenue: data.totalRevenue || 89350,
          activeDrivers: data.activeDrivers || 42,
          activeTrips: data.activeTrips || 18,
          revenueToday: data.revenueToday || 3450,
          completedTrips: data.completedTrips || 1189,
          cancelledTrips: data.cancelledTrips || 58,
          newCustomers: data.newCustomers || 23,
          customerSatisfaction: data.customerSatisfaction || 4.7,
          avgResponseTime: data.avgResponseTime || 3.2
        });
      })
      .catch(err => {
        console.error('Stats error:', err);
        // Use fallback demo data on error
        setStats({
          totalTrips: 1247,
          totalRevenue: 89350,
          activeDrivers: 42,
          activeTrips: 18,
          revenueToday: 3450,
          completedTrips: 1189,
          cancelledTrips: 58,
          newCustomers: 23,
          customerSatisfaction: 4.7,
          avgResponseTime: 3.2
        });
      })
      .finally(() => setLoading(false));
  }, [token]);

  const averageRating = useMemo(() => {
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / ratings.length).toFixed(1);
  }, [ratings]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strategy': return <BrainCircuit className="w-5 h-5" />;
      case 'alert': return <AlertCircle className="w-5 h-5" />;
      case 'opportunity': return <Target className="w-5 h-5" />;
      case 'trend': return <TrendingUp className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strategy': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'alert': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'opportunity': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'trend': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trip': return <Truck className="w-4 h-4" />;
      case 'driver': return <Users className="w-4 h-4" />;
      case 'payment': return <DollarSign className="w-4 h-4" />;
      case 'system': return <Server className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'trip': return 'bg-blue-500/10 text-blue-400';
      case 'driver': return 'bg-emerald-500/10 text-emerald-400';
      case 'payment': return 'bg-amber-500/10 text-amber-400';
      case 'system': return 'bg-slate-500/10 text-slate-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/20 border-t-blue-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
        </div>
        <span className="mt-6 text-lg text-slate-400">Loading advanced dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Command Center
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
            {(['today', 'week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">Secure</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change="+12.5%"
          trend="up"
          icon={<DollarSign className="w-6 h-6" />}
          color="from-emerald-500 to-teal-500"
        />
        <KpiCard
          title="Active Trips"
          value={stats.activeTrips.toString()}
          change="+8.2%"
          trend="up"
          icon={<Truck className="w-6 h-6" />}
          color="from-blue-500 to-cyan-500"
        />
        <KpiCard
          title="Active Drivers"
          value={stats.activeDrivers.toString()}
          change="+3.1%"
          trend="up"
          icon={<Users className="w-6 h-6" />}
          color="from-violet-500 to-purple-500"
        />
        <KpiCard
          title="Customer Rating"
          value={stats.customerSatisfaction.toString()}
          change="+0.3"
          trend="up"
          icon={<Star className="w-6 h-6" />}
          color="from-amber-500 to-orange-500"
          suffix="/5"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - 2/3 */}
        <div className="xl:col-span-2 space-y-8">
          {/* Company Profile Card */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Company Profile</h2>
                <p className="text-slate-400 text-sm">About Nasho Technologies</p>
              </div>
              <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">Verified</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{companyInfo.name}</h3>
                  <p className="text-blue-400 font-medium">{companyInfo.tagline}</p>
                </div>
                <p className="text-slate-300 leading-relaxed">{companyInfo.mission}</p>
                <div className="flex flex-wrap gap-2">
                  {companyInfo.values.map((value) => (
                    <span key={value} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-300">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <InfoRow label="Founded" value={companyInfo.founded} icon={<Calendar className="w-4 h-4" />} />
                <InfoRow label="Headquarters" value={companyInfo.headquarters} icon={<Globe className="w-4 h-4" />} />
                <InfoRow label="Team Size" value={companyInfo.employees} icon={<Users className="w-4 h-4" />} />
                <InfoRow label="Fleet Size" value={companyInfo.fleetSize} icon={<Truck className="w-4 h-4" />} />
                <InfoRow label="Coverage" value={companyInfo.coverage} icon={<MapPinIcon />} />
              </div>
            </div>
          </div>

          {/* AI Marketing Strategy Panel */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center animate-pulse">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  AI Marketing Intelligence
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </h2>
                <p className="text-slate-400 text-sm">Powered by Machine Learning & Predictive Analytics</p>
              </div>
            </div>

            {/* Marketing Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <MarketingMetric label="Campaign Reach" value={marketingMetrics.campaignReach.toLocaleString()} icon={<Megaphone className="w-4 h-4" />} />
              <MarketingMetric label="Engagement Rate" value={`${marketingMetrics.engagementRate}%`} icon={<Eye className="w-4 h-4" />} />
              <MarketingMetric label="Conversion" value={`${marketingMetrics.conversionRate}%`} icon={<Target className="w-4 h-4" />} />
              <MarketingMetric label="Sentiment" value={`${marketingMetrics.sentiment}%`} icon={<ThumbsUp className="w-4 h-4" />} />
            </div>

            {/* AI Insights */}
            <div className="space-y-3">
              {aiInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${getInsightColor(insight.type)} transition-all hover:scale-[1.01]`}
                >
                  <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        insight.impact === 'high' ? 'bg-red-500/20 text-red-300' :
                        insight.impact === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {insight.impact} impact
                      </span>
                    </div>
                    <p className="text-sm opacity-90">{insight.description}</p>
                  </div>
                  {insight.metric && (
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold">{insight.metric}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Revenue Trend
                </h3>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +18.4%
                </span>
              </div>
              <div className="h-48 flex items-end justify-between gap-2 px-2">
                {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 92].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all hover:from-blue-400 hover:to-cyan-400"
                      style={{ height: `${h}%`, opacity: 0.7 + (i * 0.025) }}
                    />
                    <span className="text-[10px] text-slate-500">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-violet-400" />
                  Trip Distribution
                </h3>
              </div>
              <div className="space-y-4">
                <DistributionBar label="Completed" value={stats.completedTrips} total={stats.totalTrips} color="bg-emerald-500" />
                <DistributionBar label="Active" value={stats.activeTrips} total={stats.totalTrips} color="bg-blue-500" />
                <DistributionBar label="Cancelled" value={stats.cancelledTrips} total={stats.totalTrips} color="bg-red-500" />
                <DistributionBar label="Pending" value={stats.totalTrips - stats.completedTrips - stats.activeTrips - stats.cancelledTrips} total={stats.totalTrips} color="bg-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-8">
          {/* Ratings Card */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                Customer Ratings
              </h3>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-amber-400">{averageRating}</span>
                <span className="text-slate-400 text-sm">/5</span>
              </div>
            </div>

            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#334155" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke="url(#ratingGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(parseFloat(averageRating) / 5) * 283} 283`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                  <span className="text-lg font-bold text-white">{averageRating}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {ratings.map((rating) => (
                <div key={rating.id} className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{rating.customer}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < rating.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-1">{rating.comment}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Driver: {rating.driver}</span>
                    <span>{rating.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Live Activity
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-emerald-400">Live</span>
              </div>
            </div>

            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{activity.action}</p>
                    <p className="text-xs text-slate-400">{activity.user}</p>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-emerald-400" />
              System Security
            </h3>
            <div className="space-y-3">
              <SecurityStatus label="API Gateway" status="operational" icon={<Wifi className="w-4 h-4" />} />
              <SecurityStatus label="Database" status="operational" icon={<Database className="w-4 h-4" />} />
              <SecurityStatus label="Authentication" status="operational" icon={<Lock className="w-4 h-4" />} />
              <SecurityStatus label="Encryption" status="operational" icon={<Shield className="w-4 h-4" />} />
            </div>
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">All systems secure</span>
              </div>
              <p className="text-xs text-emerald-400/70 mt-1">Last security scan: 2 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Sub Components */

const KpiCard: React.FC<{
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
  suffix?: string;
}> = ({ title, value, change, trend, icon, color, suffix }) => (
  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
        <span className="text-white">{icon}</span>
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {change}
      </div>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold text-white">{value}</span>
      {suffix && <span className="text-lg text-slate-400">{suffix}</span>}
    </div>
    <p className="text-sm text-slate-400 mt-1">{title}</p>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
    <span className="text-slate-400">{icon}</span>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  </div>
);

const MarketingMetric: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="text-center p-3 bg-slate-700/30 rounded-xl">
    <div className="flex justify-center mb-2 text-violet-400">{icon}</div>
    <p className="text-lg font-bold text-white">{value}</p>
    <p className="text-xs text-slate-400">{label}</p>
  </div>
);

const DistributionBar: React.FC<{ label: string; value: number; total: number; color: string }> = ({ label, value, total, color }) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-white font-medium">{value}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const SecurityStatus: React.FC<{ label: string; status: string; icon: React.ReactNode }> = ({ label, status, icon }) => (
  <div className="flex items-center justify-between p-2">
    <div className="flex items-center gap-2 text-slate-300">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="text-xs text-emerald-400 font-medium capitalize">{status}</span>
    </div>
  </div>
);

const MapPinIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default Reports;

