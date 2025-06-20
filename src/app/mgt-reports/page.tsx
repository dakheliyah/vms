'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, Filter, Users, MapPin, Calendar, TrendingUp } from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';
import { User } from '@/types';
import useCurrentUser from '@/lib/hooks/useCurrentUser';

// Dummy data for venue selections
const dummyReportData = [
  {
    id: 1,
    its_id: 12345678,
    fullname: 'Ahmed Ali Merchant',
    venue: 'Husaini Masjid Complex - CMZ',
    venue_code: 'CMZ',
    selection_date: '2024-01-15',
    status: 'Confirmed',
    family_head: 'Ahmed Ali Merchant',
    contact_number: '+94771234567',
    email: 'ahmed.merchant@email.com'
  },
  {
    id: 2,
    its_id: 12345679,
    fullname: 'Fatima Ahmed Merchant',
    venue: 'Husaini Masjid Complex - CMZ',
    venue_code: 'CMZ',
    selection_date: '2024-01-15',
    status: 'Confirmed',
    family_head: 'Ahmed Ali Merchant',
    contact_number: '+94771234567',
    email: 'ahmed.merchant@email.com'
  },
  {
    id: 3,
    its_id: 87654321,
    fullname: 'Mohammed Hassan Sheikh',
    venue: 'Mufaddal Centre - MCZ',
    venue_code: 'MCZ',
    selection_date: '2024-01-16',
    status: 'Pending',
    family_head: 'Mohammed Hassan Sheikh',
    contact_number: '+94779876543',
    email: 'hassan.sheikh@email.com'
  },
  {
    id: 4,
    its_id: 87654322,
    fullname: 'Zainab Mohammed Sheikh',
    venue: 'Mufaddal Centre - MCZ',
    venue_code: 'MCZ',
    selection_date: '2024-01-16',
    status: 'Confirmed',
    family_head: 'Mohammed Hassan Sheikh',
    contact_number: '+94779876543',
    email: 'hassan.sheikh@email.com'
  },
  {
    id: 5,
    its_id: 11223344,
    fullname: 'Ali Raza Contractor',
    venue: 'Husaini Masjid Complex - CMZ',
    venue_code: 'CMZ',
    selection_date: '2024-01-17',
    status: 'Confirmed',
    family_head: 'Ali Raza Contractor',
    contact_number: '+94771122334',
    email: 'ali.contractor@email.com'
  },
  {
    id: 6,
    its_id: 55667788,
    fullname: 'Sakina Yusuf Trader',
    venue: 'Mufaddal Centre - MCZ',
    venue_code: 'MCZ',
    selection_date: '2024-01-18',
    status: 'Confirmed',
    family_head: 'Yusuf Ali Trader',
    contact_number: '+94775566778',
    email: 'yusuf.trader@email.com'
  },
  {
    id: 7,
    its_id: 99887766,
    fullname: 'Ibrahim Mustafa Engineer',
    venue: 'Husaini Masjid Complex - CMZ',
    venue_code: 'CMZ',
    selection_date: '2024-01-19',
    status: 'Pending',
    family_head: 'Ibrahim Mustafa Engineer',
    contact_number: '+94779988776',
    email: 'ibrahim.engineer@email.com'
  },
  {
    id: 8,
    its_id: 44556677,
    fullname: 'Maryam Hussain Doctor',
    venue: 'Mufaddal Centre - MCZ',
    venue_code: 'MCZ',
    selection_date: '2024-01-20',
    status: 'Confirmed',
    family_head: 'Hussain Ali Doctor',
    contact_number: '+94774455667',
    email: 'hussain.doctor@email.com'
  }
];

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [venueFilter, setVenueFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Fetch current user data
  const { user, isLoading: userLoading, error: userError } = useCurrentUser();

  // Filter and search data - moved before conditional returns to follow Rules of Hooks
  const filteredData = useMemo(() => {
    return dummyReportData.filter(item => {
      const matchesSearch = 
        item.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.its_id.toString().includes(searchTerm) ||
        item.family_head.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesVenue = venueFilter === 'all' || item.venue_code === venueFilter;
      const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const itemDate = new Date(item.selection_date);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today':
            matchesDate = daysDiff === 0;
            break;
          case 'week':
            matchesDate = daysDiff <= 7;
            break;
          case 'month':
            matchesDate = daysDiff <= 30;
            break;
        }
      }
      
      return matchesSearch && matchesVenue && matchesStatus && matchesDate;
    });
  }, [searchTerm, venueFilter, statusFilter, dateFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredData.length;
    const cmzCount = filteredData.filter(item => item.venue_code === 'CMZ').length;
    const mczCount = filteredData.filter(item => item.venue_code === 'MCZ').length;
    const confirmedCount = filteredData.filter(item => item.status === 'Confirmed').length;
    const pendingCount = filteredData.filter(item => item.status === 'Pending').length;
    
    return {
      total,
      cmzCount,
      mczCount,
      confirmedCount,
      pendingCount,
      cmzPercentage: total > 0 ? Math.round((cmzCount / total) * 100) : 0,
      mczPercentage: total > 0 ? Math.round((mczCount / total) * 100) : 0
    };
  }, [filteredData]);

  // CSV Download function
  const downloadCSV = () => {
    const headers = [
      'ITS ID',
      'Full Name',
      'Venue',
      'Venue Code',
      'Selection Date',
      'Status',
      'Family Head',
      'Contact Number',
      'Email'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        row.its_id,
        `"${row.fullname}"`,
        `"${row.venue}"`,
        row.venue_code,
        row.selection_date,
        row.status,
        `"${row.family_head}"`,
        row.contact_number,
        row.email
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `venue-selections-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show loading state while user data is being fetched
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading 02...</p>
        </div>
      </div>
    );
  }

  // Show error state if user data failed to load
  if (userError || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading user data: {userError || 'User not found'}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Venue Selection Reports</h1>
            <p className="text-gray-600 mt-1">Track and analyze venue preferences for Colombo Relay Centre</p>
          </div>
          <Button 
            onClick={downloadCSV}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Selections</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">CMZ Selections</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.cmzCount}</p>
                  <p className="text-xs text-gray-500">{stats.cmzPercentage}% of total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">MCZ Selections</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.mczCount}</p>
                  <p className="text-xs text-gray-500">{stats.mczPercentage}% of total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.confirmedCount}</p>
                  <p className="text-xs text-gray-500">{stats.pendingCount} pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <Input
                  placeholder="Search by name, ITS ID, or family head..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                <Select value={venueFilter} onValueChange={setVenueFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Venues" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Venues</SelectItem>
                    <SelectItem value="CMZ">Husaini Masjid Complex - CMZ</SelectItem>
                    <SelectItem value="MCZ">Mufaddal Centre - MCZ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Venue Selection Data ({filteredData.length} records)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-medium text-gray-700">ITS ID</th>
                    <th className="text-left p-3 font-medium text-gray-700">Full Name</th>
                    <th className="text-left p-3 font-medium text-gray-700">Venue</th>
                    <th className="text-left p-3 font-medium text-gray-700">Selection Date</th>
                    <th className="text-left p-3 font-medium text-gray-700">Status</th>
                    <th className="text-left p-3 font-medium text-gray-700">Family Head</th>
                    <th className="text-left p-3 font-medium text-gray-700">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{item.its_id}</td>
                      <td className="p-3 text-gray-900">{item.fullname}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            item.venue_code === 'CMZ' ? 'bg-green-500' : 'bg-purple-500'
                          }`}></span>
                          <span className="text-gray-900">{item.venue}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">
                        {new Date(item.selection_date).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{item.family_head}</td>
                      <td className="p-3 text-gray-600">{item.contact_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredData.map((item) => (
                <Card key={item.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-gray-500">ITS ID</div>
                          <div className="text-base font-semibold text-gray-900">{item.its_id}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-500">Full Name</div>
                        <div className="text-base font-medium text-gray-900">{item.fullname}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-500">Venue</div>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            item.venue_code === 'CMZ' ? 'bg-green-500' : 'bg-purple-500'
                          }`}></span>
                          <span className="text-base text-gray-900">{item.venue}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500">Selection Date</div>
                          <div className="text-sm text-gray-900">
                            {new Date(item.selection_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Family Head</div>
                          <div className="text-sm text-gray-900">{item.family_head}</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-500">Contact</div>
                        <div className="text-sm text-gray-900">{item.contact_number}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg">No records found</div>
                <div className="text-gray-400 text-sm mt-1">Try adjusting your filters</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}