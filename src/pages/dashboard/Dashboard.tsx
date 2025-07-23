import React from 'react';
import { Users, BookOpen, FileText, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { useApi } from '../../hooks/useApi';
import { dashboardService } from '../../services/dashboard';
import { LoadingSpinner, CardSkeleton } from '../../components/common/LoadingSpinner';
import { ApiError, ErrorBoundary } from '../../components/common/ErrorBoundary';
import { UI_CONFIG } from '../../config/constants';

export const Dashboard: React.FC = () => {
  // API hooks for data fetching
  const { 
    data: stats, 
    loading: statsLoading, 
    error: statsError, 
    refresh: refreshStats 
  } = useApi(dashboardService.getStats);

  const { 
    data: registrationData, 
    loading: registrationLoading, 
    error: registrationError 
  } = useApi(() => dashboardService.getRegistrationData('month'));

  const { 
    data: testAttemptData, 
    loading: testAttemptLoading, 
    error: testAttemptError 
  } = useApi(() => dashboardService.getTestAttemptData('week'));

  const { 
    data: categoryData, 
    loading: categoryLoading, 
    error: categoryError 
  } = useApi(dashboardService.getCategoryData);

  const { 
    data: recentActivity, 
    loading: activityLoading, 
    error: activityError 
  } = useApi(() => dashboardService.getRecentActivity(5));

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statsLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))
          ) : statsError ? (
            <div className="col-span-full">
              <ApiError error={statsError} onRetry={refreshStats} />
            </div>
          ) : stats ? (
            <>
              <StatsCard
                title="Total Students"
                value={stats.total_students.toLocaleString()}
                change="12%"
                changeType="increase"
                icon={Users}
                color="blue"
              />
              <StatsCard
                title="Active Today"
                value={stats.active_students_today}
                change="8%"
                changeType="increase"
                icon={Activity}
                color="green"
              />
              <StatsCard
                title="Test Series"
                value={stats.total_test_series}
                change="3 new"
                changeType="increase"
                icon={BookOpen}
                color="purple"
              />
              <StatsCard
                title="Test Attempts Today"
                value={stats.test_attempts_today}
                change="23%"
                changeType="increase"
                icon={TrendingUp}
                color="yellow"
              />
              <StatsCard
                title="PDF Resources"
                value={stats.total_pdfs}
                change="5 new"
                changeType="increase"
                icon={FileText}
                color="red"
              />
              <StatsCard
                title="Monthly Revenue"
                value={`₹${stats.monthly_revenue.toLocaleString()}`}
                change="18%"
                changeType="increase"
                icon={DollarSign}
                color="green"
              />
            </>
          ) : null}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Registration Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Registrations</h3>
            {registrationLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <LoadingSpinner text="Loading chart data..." />
              </div>
            ) : registrationError ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-500">Failed to load registration data</p>
              </div>
            ) : registrationData ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={registrationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="value" 
                    fill={UI_CONFIG.CHART.COLORS.PRIMARY} 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          {/* Test Attempts Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Test Attempts</h3>
            {testAttemptLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <LoadingSpinner text="Loading chart data..." />
              </div>
            ) : testAttemptError ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-500">Failed to load test attempt data</p>
              </div>
            ) : testAttemptData ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={testAttemptData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={UI_CONFIG.CHART.COLORS.SUCCESS} 
                    strokeWidth={3}
                    dot={{ fill: UI_CONFIG.CHART.COLORS.SUCCESS, strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          {/* Category Distribution */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Categories</h3>
            {categoryLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <LoadingSpinner text="Loading chart data..." />
              </div>
            ) : categoryError ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-500">Failed to load category data</p>
              </div>
            ) : categoryData ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => {
                      const colors = Object.values(UI_CONFIG.CHART.COLORS);
                      return (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      );
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {activityLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="animate-pulse flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activityError ? (
              <p className="text-gray-500">Failed to load recent activity</p>
            ) : recentActivity ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'user' ? 'bg-blue-500' :
                      activity.type === 'test' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};