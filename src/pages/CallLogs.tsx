import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../lib/api';
import { Phone, Clock, User, Calendar, FileText } from 'lucide-react';

const CallLogs: React.FC = () => {
    const [calls, setCalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCall, setSelectedCall] = useState<any>(null);

    useEffect(() => {
        fetchCalls();
    }, []);

    const fetchCalls = async () => {
        try {
            const response = await dashboardAPI.getCalls();
            setCalls(response.data.calls || []);
        } catch (error) {
            console.error('Failed to fetch calls:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-300';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'failed': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
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
            <div>
                <h1 className="text-3xl font-bold">Call Logs</h1>
                <p className="text-gray-600 mt-1">View all AI assistant call history</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat-card">
                    <p className="text-sm text-gray-600">Total Calls</p>
                    <p className="text-2xl font-bold mt-1">{calls.length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold mt-1 text-green-600">
                        {calls.filter(c => c.status === 'completed').length}
                    </p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-600">Avg Duration</p>
                    <p className="text-2xl font-bold mt-1">
                        {calls.length > 0
                            ? formatDuration(Math.floor(calls.reduce((sum, c) => sum + (c.duration || 0), 0) / calls.length))
                            : '0:00'}
                    </p>
                </div>
                <div className="stat-card">
                    <p className="text-sm text-gray-600">Total Duration</p>
                    <p className="text-2xl font-bold mt-1">
                        {formatDuration(calls.reduce((sum, c) => sum + (c.duration || 0), 0))}
                    </p>
                </div>
            </div>

            {/* Call List */}
            <div className="card">
                <h2 className="text-xl font-bold mb-4">Call History</h2>

                {calls.length === 0 ? (
                    <div className="text-center py-12">
                        <Phone size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No calls yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {calls.map((call) => (
                            <div
                                key={call.id}
                                className="border-2 border-gray-200 rounded-lg p-4 hover:border-black transition-all duration-200 cursor-pointer"
                                onClick={() => setSelectedCall(call)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Phone size={20} className="text-black" />
                                            <h3 className="text-lg font-bold">{call.caller_number || 'Unknown Number'}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(call.status)}`}>
                                                {call.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                            <div className="flex items-center space-x-2">
                                                <Calendar size={16} />
                                                <span>{new Date(call.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Clock size={16} />
                                                <span>{new Date(call.created_at).toLocaleTimeString()}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Clock size={16} />
                                                <span>Duration: {formatDuration(call.duration || 0)}</span>
                                            </div>
                                        </div>

                                        {call.transcript && (
                                            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                                                <p className="line-clamp-2">{call.transcript}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 md:mt-0 md:ml-4">
                                        {call.recording_url && (
                                            <a
                                                href={call.recording_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary text-sm"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Listen
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Call Detail Modal */}
            {selectedCall && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedCall(null)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">Call Details</h2>
                            <button
                                onClick={() => setSelectedCall(null)}
                                className="text-gray-500 hover:text-black"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Caller Number</p>
                                    <p className="font-bold">{selectedCall.caller_number || 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedCall.status)}`}>
                                        {selectedCall.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Date</p>
                                    <p className="font-bold">{new Date(selectedCall.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Duration</p>
                                    <p className="font-bold">{formatDuration(selectedCall.duration || 0)}</p>
                                </div>
                            </div>

                            {selectedCall.transcript && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Transcript</p>
                                    <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                                        <p className="whitespace-pre-wrap">{selectedCall.transcript}</p>
                                    </div>
                                </div>
                            )}

                            {selectedCall.recording_url && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Recording</p>
                                    <audio controls className="w-full">
                                        <source src={selectedCall.recording_url} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallLogs;
