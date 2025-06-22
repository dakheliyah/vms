'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/DashboardHeader';
import Footer from '@/components/Footer';
import useCurrentUser from '@/lib/hooks/useCurrentUser';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Define the type for the API response data
interface ReportData {
  its_id: number;
  hof_id: number;
  fullname: string;
  gender: string;
  age: number;
  mobile: string | null;
  country: string;
  created_at: string;
  updated_at: string;
  jamaat: string;
  idara: string | null;
  category: string | null;
  prefix: string | null;
  title: string | null;
  venue_waaz: string | null;
  city: string | null;
  local_mehman: boolean;
  arr_place_date: string | null;
  flight_code: string | null;
  whatsapp_link_clicked: boolean;
  daily_trans: boolean;
  acc_arranged_at: string | null;
  acc_zone: string | null;
  pass_preferences: Array<{
    id: number;
    its_id: number;
    block_id: number | null;
    created_at: string;
    updated_at: string;
    vaaz_center_id: number;
    event_id: number;
    pass_type: string | null;
    vaaz_center_name: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

export default function ReportGraphicalPage() {
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const user = localStorage.getItem('its_no');

      try {
        const response = await fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/mumineen/pass-preference/breakdown?event_id=1', {
            headers: {
                'Token': user || '',
            }
        });
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const result = await response.json();
        if (Array.isArray(result)) {
            setData(result);
        } else if (result && Array.isArray(result.data)) {
            setData(result.data);
        } else {
            console.warn('API response was not in the expected format:', result);
            setData([]);
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred');
        }
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const centerSpecificData = useMemo(() => {
    const groupedData: { [key: string]: ReportData[] } = {};

    data.forEach(item => {
      const center = item.pass_preferences?.[0]?.vaaz_center_name || 'Unassigned';
      if (!groupedData[center]) {
        groupedData[center] = [];
      }
      groupedData[center].push(item);
    });

    const allCentersData = {
      'All Centers': data,
      ...groupedData
    }

    return Object.entries(allCentersData).map(([centerName, centerData]) => {
      const genderCounts: { [key: string]: number } = {};
      centerData.forEach(item => {
        const gender = item.gender || 'Unknown';
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
      });
      const genderDistribution = Object.keys(genderCounts).map(name => ({ name, value: genderCounts[name] }));

      const ageGroups = {
        '0-5': 0,
        '6-15': 0,
        '16-65': 0,
        '65+': 0,
      };
      centerData.forEach(item => {
        if (item.age <= 5) {
          ageGroups['0-5']++;
        } else if (item.age <= 15) {
          ageGroups['6-15']++;
        } else if (item.age <= 65) {
          ageGroups['16-65']++;
        } else {
          ageGroups['65+']++;
        }
      });
      const ageDistribution = Object.keys(ageGroups).map(name => ({ name, count: ageGroups[name as keyof typeof ageGroups] }));

      return { centerName, genderDistribution, ageDistribution, total: centerData.length };
    });
  }, [data]);

  const vaazCenterData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    data.forEach(item => {
      const center = item.pass_preferences?.[0]?.vaaz_center_name || 'Unassigned';
      counts[center] = (counts[center] || 0) + 1;
    });
    return Object.keys(counts).map(name => ({ name, count: counts[name] }));
  }, [data]);

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading graphical data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-red-500 text-lg font-medium">Error: {error}</p>
        </div>
    );
  }

  const renderHeader = () => {
    if (currentUser && !userLoading) {
      return <Header user={currentUser} />;
    }
    return (
      <header className="bg-primary text-primary-foreground py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Reports Dashboard</h1>
        </div>
      </header>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-foreground">
      {renderHeader()}
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-primary-green">Graphical Report</h2>
          
          <div className="mb-12">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">Overall Vaaz Center Distribution</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={vaazCenterData} margin={{ top: 5, right: 20, left: -10, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-60} textAnchor="end" interval={0} style={{ fontSize: '0.8rem' }} />
                <YAxis />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {centerSpecificData.map(({ centerName, genderDistribution, ageDistribution, total }) => (
            <div key={centerName} className="mb-12 p-2 sm:p-4 border rounded-lg">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">{centerName} (Total: {total})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="bg-white p-2 sm:p-4 rounded-lg shadow">
                  <h4 className="text-base sm:text-lg font-semibold mb-4">Gender Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={genderDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" label>
                        {genderDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white p-2 sm:p-4 rounded-lg shadow">
                  <h4 className="text-base sm:text-lg font-semibold mb-4">Age Group Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ageDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
