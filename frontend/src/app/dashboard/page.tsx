'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  MessageCircle,
  TrendingUp,
  Award,
  Activity,
  Calendar,
} from 'lucide-react';

interface DashboardStats {
  summary: {
    totalContacts: number;
    activeConversations: number;
    qualifiedLeads: number;
    closedDeals: number;
    conversionRate: number;
    avgLeadScore: number;
  };
  contactsBySource: Array<{ source: string; count: number }>;
  contactsByStatus: Array<{ status: string; count: number }>;
  contactsTrend: Array<{ date: string; count: number }>;
  messageStats: Array<{ type: string; count: number }>;
}

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  indigo: '#6366F1',
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/api/analytics/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600">Error al cargar estadísticas</div>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    NEW: 'Nuevo',
    CONTACTED: 'Contactado',
    QUALIFIED: 'Calificado',
    PROPOSAL: 'Propuesta',
    WON: 'Ganado',
    LOST: 'Perdido',
  };

  const sourceLabels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    facebook: 'Facebook',
    manual: 'Manual',
    website: 'Web',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {user?.name || 'Usuario'} 👋
        </h1>
        <p className="text-gray-600 mt-1">Aquí está el resumen de tu CRM</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Contactos"
          value={stats.summary?.totalContacts || 0}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Conversaciones"
          value={stats.summary?.activeConversations || 0}
          icon={<MessageCircle className="w-6 h-6" />}
          color="green"
          trend="+8%"
        />
        <StatCard
          title="Leads Calificados"
          value={stats.summary?.qualifiedLeads || 0}
          icon={<TrendingUp className="w-6 h-6" />}
          color="yellow"
          trend="+15%"
        />
        <StatCard
          title="Ventas Cerradas"
          value={stats.summary?.closedDeals || 0}
          icon={<Award className="w-6 h-6" />}
          color="purple"
          trend="+5%"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tasa de Conversión</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.summary?.conversionRate || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Score Promedio</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.summary?.avgLeadScore || 0}/100
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Última Actualización</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {new Date().toLocaleDateString('es-MX', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de Contactos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tendencia de Contactos (7 días)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.contactsTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={date =>
                  new Date(date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
                }
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                name="Contactos"
                stroke={COLORS.primary}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Contactos por Fuente */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contactos por Fuente</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={(stats.contactsBySource || []).map(item => ({
                  name: sourceLabels[item.source] || item.source,
                  value: item.count,
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {stats.contactsBySource.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Contactos por Estado */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline de Ventas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.contactsByStatus || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="status"
                tickFormatter={status => statusLabels[status] || status}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Contactos" fill={COLORS.success} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Actividad de Mensajes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad de Mensajes (30 días)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.messageStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Mensajes" fill={COLORS.indigo} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a
            href="/dashboard/contacts"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <Users className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Ver Contactos</p>
          </a>
          <a
            href="/dashboard/whatsapp"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <MessageCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">WhatsApp</p>
          </a>
          <a
            href="/dashboard/calendar"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <Calendar className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Calendario</p>
          </a>
          <a
            href="/dashboard/integrations"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <Activity className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Integraciones</p>
          </a>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  trend?: string;
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}
