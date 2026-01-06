import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
    Phone,
    Calendar,
    Users,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    PhoneCall,
    Mail,
    Settings as SettingsIcon
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('all');

    useEffect(() => {
        fetchStats();
    }, [dateRange]);

    const fetchStats = async () => {
        try {
            const today = new Date();
            let params: any = {};

            if (dateRange === 'upcoming90') {
                const end = new Date();
                end.setDate(end.getDate() + 90);
                params.startDate = today.toISOString().split('T')[0];
                params.endDate = end.toISOString().split('T')[0];
            } else if (dateRange !== 'all') {
                const days = parseInt(dateRange, 10);
                const start = new Date();
                start.setDate(start.getDate() - days);
                params.startDate = start.toISOString().split('T')[0];
                params.endDate = today.toISOString().split('T')[0];
            }

            const response = await dashboardAPI.getStats(params);
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="loading w-12 h-12"></div>
            </div>
        );
    }

    const COLORS = ['#000000', '#666666', '#999999', '#cccccc'];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back, {user?.owner_name || user?.name}!</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="input"
                    >
                        <option value="all">All time</option>
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="upcoming90">Next 90 days</option>
                    </select>
                </div>
            </div>

            {/* Quick Info Cards */}
            {user?.vapi_phone_number && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="stat-card bg-black text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-300">Your AI Phone Number</p>
                                <p className="text-2xl font-bold mt-1">{user.vapi_phone_number}</p>
                            </div>
                            <PhoneCall size={40} className="text-white opacity-50" />
                        </div>
                    </div>
                    <div className="stat-card bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">BCC Email</p>
                                <p className="text-lg font-bold mt-1 break-all">{user.bcc_email}</p>
                            </div>
                            <Mail size={40} className="text-black opacity-20" />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Bookings</p>
                            <p className="text-3xl font-bold mt-2">{stats?.bookings?.total || 0}</p>
                            <p className="text-sm text-green-600 mt-1">
                                {stats?.bookings?.confirmed || 0} confirmed
                            </p>
                        </div>
                        <Calendar size={40} className="text-black opacity-20" />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Calls</p>
                            <p className="text-3xl font-bold mt-2">{stats?.calls?.total || 0}</p>
                            <p className="text-sm text-green-600 mt-1">
                                {stats?.calls?.successful || 0} successful
                            </p>
                        </div>
                        <Phone size={40} className="text-black opacity-20" />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Guests</p>
                            <p className="text-3xl font-bold mt-2">{stats?.bookings?.totalGuests || 0}</p>
                            <p className="text-sm text-gray-600 mt-1">
                                Avg: {stats?.bookings?.avgPartySize || 0} per booking
                            </p>
                        </div>
                        <Users size={40} className="text-black opacity-20" />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg Call Duration</p>
                            <p className="text-3xl font-bold mt-2">{stats?.calls?.avgDuration || 0}s</p>
                            <p className="text-sm text-gray-600 mt-1">
                                Per call
                            </p>
                        </div>
                        <Clock size={40} className="text-black opacity-20" />
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Booking Sources */}
                <div className="card">
                    <h3 className="text-xl font-bold mb-4">Booking Sources</h3>
                    {stats?.bookings?.bySource && Object.keys(stats.bookings.bySource).length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={Object.entries(stats.bookings.bySource).map(([name, value]) => ({ name, value }))}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {Object.entries(stats.bookings.bySource).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                            No booking data yet
                        </div>
                    )}
                </div>

                {/* Booking Status */}
                <div className="card">
                    <h3 className="text-xl font-bold mb-4">Booking Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="text-green-600" size={24} />
                                <span className="font-medium">Confirmed</span>
                            </div>
                            <span className="text-2xl font-bold">{stats?.bookings?.confirmed || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <XCircle className="text-red-600" size={24} />
                                <span className="font-medium">Cancelled</span>
                            </div>
                            <span className="text-2xl font-bold">{stats?.bookings?.cancelled || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <TrendingUp className="text-gray-600" size={24} />
                                <span className="font-medium">Success Rate</span>
                            </div>
                            <span className="text-2xl font-bold">
                                {stats?.bookings?.total > 0
                                    ? ((stats.bookings.confirmed / stats.bookings.total) * 100).toFixed(1)
                                    : 0}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="card">
                    <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
                    <div className="space-y-3">
                        {stats?.recent?.bookings && stats.recent.bookings.length > 0 ? (
                            stats.recent.bookings.slice(0, 5).map((booking: any) => (
                                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div>
                                        <p className="font-medium">{booking.guest_name}</p>
                                        <p className="text-sm text-gray-600">
                                            {booking.party_size} guests • {booking.booking_date} at {booking.booking_time}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-center py-8">No recent bookings</p>
                        )}
                    </div>
                </div>

                {/* Recent Calls */}
                <div className="card">
                    <h3 className="text-xl font-bold mb-4">Recent Calls</h3>
                    <div className="space-y-3">
                        {stats?.recent?.calls && stats.recent.calls.length > 0 ? (
                            stats.recent.calls.slice(0, 5).map((call: any) => (
                                <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div>
                                        <p className="font-medium">{call.caller_number || 'Unknown'}</p>
                                        <p className="text-sm text-gray-600">
                                            {call.duration}s • {new Date(call.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${call.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {call.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-center py-8">No recent calls</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
