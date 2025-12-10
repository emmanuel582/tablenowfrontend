import React, { useEffect, useState } from 'react';
import { bookingsAPI } from '../lib/api';
import { Calendar, Users, Clock, Mail, Phone, Search, Filter, Plus } from 'lucide-react';

const Bookings: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    const fetchBookings = async () => {
        try {
            const params: any = {};
            if (filter !== 'all') params.status = filter;

            const response = await bookingsAPI.getAll(params);
            setBookings(response.data.bookings || []);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(booking =>
        booking.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guest_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.confirmation_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-300';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'phone': return <Phone size={16} />;
            case 'manual': return <Plus size={16} />;
            default: return <Mail size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="loading w-12 h-12"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Bookings</h1>
                    <p className="text-gray-600 mt-1">Manage all your reservations</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or confirmation number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Filter size={20} className="text-gray-600" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="input"
                        >
                            <option value="all">All Bookings</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat-card">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold mt-1">{bookings.length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-600">Confirmed</p>
                    <p className="text-2xl font-bold mt-1 text-green-600">
                        {bookings.filter(b => b.status === 'confirmed').length}
                    </p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold mt-1 text-red-600">
                        {bookings.filter(b => b.status === 'cancelled').length}
                    </p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-600">Total Guests</p>
                    <p className="text-2xl font-bold mt-1">
                        {bookings.reduce((sum, b) => sum + (b.party_size || 0), 0)}
                    </p>
                </div>
            </div>

            {/* Bookings List */}
            <div className="card">
                <h2 className="text-xl font-bold mb-4">All Bookings</h2>

                {filteredBookings.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No bookings found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="border-2 border-gray-200 rounded-lg p-4 hover:border-black transition-all duration-200"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h3 className="text-lg font-bold">{booking.guest_name}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                            <span className="flex items-center space-x-1 text-xs text-gray-500">
                                                {getSourceIcon(booking.source)}
                                                <span>{booking.source}</span>
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                                            <div className="flex items-center space-x-2">
                                                <Calendar size={16} />
                                                <span>{booking.booking_date}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Clock size={16} />
                                                <span>{booking.booking_time}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Users size={16} />
                                                <span>{booking.party_size} guests</span>
                                            </div>
                                            {booking.guest_email && (
                                                <div className="flex items-center space-x-2">
                                                    <Mail size={16} />
                                                    <span className="truncate">{booking.guest_email}</span>
                                                </div>
                                            )}
                                        </div>

                                        {booking.special_requests && (
                                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                                <strong>Special Requests:</strong> {booking.special_requests}
                                            </div>
                                        )}

                                        {booking.confirmation_number && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                Confirmation: <span className="font-mono font-bold">{booking.confirmation_number}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 md:mt-0 md:ml-4 flex space-x-2">
                                        {booking.status === 'confirmed' && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to cancel this booking?')) {
                                                        bookingsAPI.cancel(booking.id).then(() => fetchBookings());
                                                    }
                                                }}
                                                className="btn btn-secondary text-sm"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bookings;
