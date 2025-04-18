// src/app/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';

// Types for our analytics data
interface EngagementData {
    date: string;
    likes: number;
    comments: number;
    shares: number;
}

interface ImpressionData {
    date: string;
    impressions: number;
}

interface ContentTypeData {
    type: string;
    count: number;
    color: string;
}

interface FollowerGrowthData {
    date: string;
    followers: number;
}

export default function AnalyticsPage() {
    // Removed unused 'session' variable here
    const { status } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
    const [impressionData, setImpressionData] = useState<ImpressionData[]>([]);
    const [contentTypeData, setContentTypeData] = useState<ContentTypeData[]>([]);
    const [followerGrowthData, setFollowerGrowthData] = useState<FollowerGrowthData[]>([]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchAnalyticsData();
        } else if (status === 'unauthenticated') {
            // If not authenticated, stop loading and potentially show a message or redirect
            setLoading(false);
        }
    }, [status]);

    const fetchAnalyticsData = async () => {
        // Reset state before fetching
        setLoading(true);
        setError(null);
        setEngagementData([]);
        setImpressionData([]);
        setContentTypeData([]);
        setFollowerGrowthData([]);

        try {
            // In a real app, these would be separate API calls to fetch different metrics
            // For this example, we'll simulate with dummy data

            // Simulate API calls (Replace with actual fetches)
            // const engagementResponse = await fetch('/api/analytics/engagement');
            // const engagement = await engagementResponse.json();
            // setEngagementData(engagement);
            // ... other fetches

            // For demo purposes, generate some sample data
            const sampleEngagementData: EngagementData[] = [];
            const sampleImpressionData: ImpressionData[] = [];
            const sampleFollowerGrowthData: FollowerGrowthData[] = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                sampleEngagementData.push({ date: dateStr, likes: Math.floor(Math.random() * 50) + 10, comments: Math.floor(Math.random() * 20) + 5, shares: Math.floor(Math.random() * 10) + 2 });
                sampleImpressionData.push({ date: dateStr, impressions: Math.floor(Math.random() * 500) + 100 });
                sampleFollowerGrowthData.push({ date: dateStr, followers: 200 + Math.floor(Math.random() * 20) * (7 - i) }); // Adjusted logic for growth
            }

            const sampleContentTypeData: ContentTypeData[] = [
                { type: 'Text Only', count: 45, color: '#8884d8' },
                { type: 'With Images', count: 30, color: '#82ca9d' },
                { type: 'With Links', count: 15, color: '#ffc658' },
                { type: 'With Videos', count: 10, color: '#ff8042' } // Placeholder
            ];

            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 500));

            setEngagementData(sampleEngagementData);
            setImpressionData(sampleImpressionData);
            setContentTypeData(sampleContentTypeData);
            setFollowerGrowthData(sampleFollowerGrowthData);

        } catch (err) {
            setError('Failed to load analytics data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Sign in to view your analytics</h1>
                <p>You need to be signed in to access this page.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg text-red-600 dark:text-red-200">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

            {/* Check if data exists before rendering charts */}
            {engagementData.length === 0 && impressionData.length === 0 && contentTypeData.length === 0 && followerGrowthData.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                    No analytics data available yet. Start posting and engaging!
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Engagement Metrics */}
                        {engagementData.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-4">Post Engagement (Last 7 Days)</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={engagementData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="likes" name="Likes" fill="#8884d8" />
                                            <Bar dataKey="comments" name="Comments" fill="#82ca9d" />
                                            <Bar dataKey="shares" name="Shares" fill="#ffc658" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Impressions */}
                        {impressionData.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-4">Post Impressions (Last 7 Days)</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={impressionData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Content Type Distribution */}
                        {contentTypeData.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-4">Content Type Distribution</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={contentTypeData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label >
                                                {contentTypeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Follower Growth */}
                        {followerGrowthData.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                <h2 className="text-lg font-semibold mb-4">Follower Growth (Last 7 Days)</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={followerGrowthData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis domain={['auto', 'auto']} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="followers" name="Followers" stroke="#82ca9d" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Total Posts</p>
                            <h3 className="text-2xl font-bold">128</h3> {/* Replace with real data */}
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Total Followers</p>
                            <h3 className="text-2xl font-bold">{followerGrowthData[followerGrowthData.length - 1]?.followers || 0}</h3>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Avg. Engagement Rate</p>
                            <h3 className="text-2xl font-bold">5.2%</h3> {/* Replace with real data */}
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Top Performing Post</p>
                            <h3 className="text-2xl font-bold">342 likes</h3> {/* Replace with real data */}
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
                        <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
                        <ul className="space-y-2">
                            <li className="flex items-start">
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                                <p>Post more content with images to potentially increase engagement based on simulated audience preferences.</p>
                            </li>
                            <li className="flex items-start">
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                                <p>Optimal posting time for your audience appears to be between 6-8 PM based on simulated data.</p>
                            </li>
                            <li className="flex items-start">
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                                <p>Your follower growth is steady. Consider engaging more with trending topics to accelerate growth.</p>
                            </li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}