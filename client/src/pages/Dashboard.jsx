import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { goalsAPI, habitsAPI, tasksAPI, simulationAPI } from '../api/apiClient';
import { Target, Zap, CheckSquare, TrendingUp, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    goals: 0,
    habits: 0,
    tasks: 0,
    systemHealth: 0
  });
  const [recentGoals, setRecentGoals] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [goalsRes, habitsRes, tasksRes, healthRes, todayRes] = await Promise.all([
        goalsAPI.getAll(),
        habitsAPI.getAll(),
        tasksAPI.getAll(),
        simulationAPI.getSystemHealth(),
        tasksAPI.getToday()
      ]);

      setStats({
        goals: goalsRes.data.length,
        habits: habitsRes.data.length,
        tasks: tasksRes.data.filter(t => t.status !== 'completed').length,
        systemHealth: healthRes.data.systemHealth || 0
      });

      setRecentGoals(goalsRes.data.slice(0, 5));
      setTodayTasks(todayRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DesignMyLife</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label="Active Goals"
            value={stats.goals}
            color="blue"
          />
          <StatCard
            icon={<Zap className="w-6 h-6" />}
            label="Active Habits"
            value={stats.habits}
            color="green"
          />
          <StatCard
            icon={<CheckSquare className="w-6 h-6" />}
            label="Pending Tasks"
            value={stats.tasks}
            color="purple"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="System Health"
            value={`${stats.systemHealth}%`}
            color="orange"
          />
        </div>

        {/* Recent Goals & Today's Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Goals */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Recent Goals</h2>
            {recentGoals.length > 0 ? (
              <div className="space-y-3">
                {recentGoals.map((goal) => (
                  <div key={goal._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{goal.title}</h3>
                        <p className="text-sm text-gray-600">{goal.category}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                        goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {goal.priority}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No goals yet. Create your first goal!</p>
            )}
          </div>

          {/* Today's Tasks */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Today's Tasks</h2>
            {todayTasks.length > 0 ? (
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div key={task._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600"
                      readOnly
                    />
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600">{task.estimatedTime} min</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No tasks for today!</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 card">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition">
              <Target className="w-8 h-8 mx-auto mb-2 text-primary-600" />
              <span className="text-sm font-medium">New Goal</span>
            </button>
            <button className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition">
              <Zap className="w-8 h-8 mx-auto mb-2 text-primary-600" />
              <span className="text-sm font-medium">New Habit</span>
            </button>
            <button className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 text-primary-600" />
              <span className="text-sm font-medium">New Task</span>
            </button>
            <button className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary-600" />
              <span className="text-sm font-medium">Simulate</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
