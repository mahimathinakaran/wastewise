import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { reportsAPI } from '../lib/api';
import { toast } from 'sonner';
import { 
  BarChart3, 
  Loader2, 
  TrendingUp, 
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [statsData, reportsData] = await Promise.all([
        reportsAPI.getStats(),
        reportsAPI.getAllReports()
      ]);
      setStats(statsData);
      setReports(reportsData);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data
  const statusData = stats ? [
    { name: 'Pending', value: stats.pending, color: '#eab308' },
    { name: 'In Progress', value: stats.in_progress, color: '#3b82f6' },
    { name: 'Completed', value: stats.completed, color: '#22c55e' }
  ] : [];

  const barChartData = stats ? [
    { status: 'Pending', count: stats.pending, fill: '#eab308' },
    { status: 'In Progress', count: stats.in_progress, fill: '#3b82f6' },
    { status: 'Completed', count: stats.completed, fill: '#22c55e' }
  ] : [];

  // Timeline data (last 7 days)
  const getTimelineData = () => {
    if (!reports.length) return [];
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayReports = reports.filter(r => {
        const reportDate = new Date(r.timestamp).toISOString().split('T')[0];
        return reportDate === date;
      });

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pending: dayReports.filter(r => r.status === 'pending').length,
        in_progress: dayReports.filter(r => r.status === 'in_progress').length,
        completed: dayReports.filter(r => r.status === 'completed').length,
        total: dayReports.length
      };
    });
  };

  const timelineData = getTimelineData();

  // Calculate completion rate
  const completionRate = stats && stats.total > 0 
    ? ((stats.completed / stats.total) * 100).toFixed(1) 
    : 0;

  const inProgressRate = stats && stats.total > 0
    ? ((stats.in_progress / stats.total) * 100).toFixed(1)
    : 0;

  const pendingRate = stats && stats.total > 0
    ? ((stats.pending / stats.total) * 100).toFixed(1)
    : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive insights and statistics for waste management reports
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-green-600" />
            </div>
          ) : stats ? (
            <div className="space-y-8">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.total}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">Total Reports</p>
                  <p className="text-xs text-muted-foreground mt-1">All time submissions</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                    <span className="text-2xl font-bold text-yellow-600">
                      {stats.pending}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">Pending</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pendingRate}% of total
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.in_progress}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">In Progress</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {inProgressRate}% of total
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {stats.completed}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">Completed</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {completionRate}% success rate
                  </p>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">Report Status Distribution</h2>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="status" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">Status Breakdown</h2>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Timeline Chart */}
              {timelineData.length > 0 && (
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-1">7-Day Activity Timeline</h2>
                    <p className="text-sm text-muted-foreground">
                      Report submissions and status changes over the last week
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="pending" 
                        stroke="#eab308" 
                        fillOpacity={1} 
                        fill="url(#colorPending)"
                        name="Pending"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="in_progress" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorInProgress)"
                        name="In Progress"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="#22c55e" 
                        fillOpacity={1} 
                        fill="url(#colorCompleted)"
                        name="Completed"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Performance Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Completion Rate</h3>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {completionRate}%
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.completed} out of {stats.total} reports completed
                  </p>
                </div>

                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Active Work</h3>
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stats.in_progress}
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${inProgressRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Reports currently being addressed
                  </p>
                </div>

                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Pending Queue</h3>
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {stats.pending}
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pendingRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Reports awaiting initial review
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}