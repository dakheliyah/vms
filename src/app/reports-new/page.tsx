'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/DashboardHeader'; // Assuming a generic header, adjust if needed
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For potential filters
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter } from 'lucide-react';
import useCurrentUser from '@/lib/hooks/useCurrentUser'; // Re-using for consistency if user context is needed

// Define the type for the API response data
interface ReportData {
  its_id: number;
  hof_id: number;
  fullname: string;
  gender: string;
  age: number;
  mobile: string | null; // Updated to allow null
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

const ITEMS_PER_PAGE = 20;

export default function ReportsNewPage() {
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterVaazCenter, setFilterVaazCenter] = useState(''); // New filter state

  // Consistent user fetching, though not directly used for data display yet
  const { user: currentUser, isLoading: userLoading, error: userError } = useCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Get current user
      const user = localStorage.getItem('its_no');

      try {
        // Add header token to this
        const response = await fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/mumineen/pass-preference/breakdown?event_id=1', {
            headers: {
                'Token': user || ''
            }
        }); // Using relative path for API route
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const result = await response.json();
        // Assuming the API returns an array of ReportData directly or has a data property
        if (Array.isArray(result)) {
            setData(result);
        } else if (result && Array.isArray(result.data)) { // Common pattern for APIs to wrap data
            setData(result.data);
        } else {
            console.warn('API response was not in the expected format:', result);
            setData([]); // Set to empty if format is unexpected
            // Optionally, set an error message here
            // setError('Unexpected data format from API.');
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

  const filteredData = useMemo(() => {
    return data
      .filter(item => 
        item.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.its_id.toString().includes(searchTerm)
      )
      .filter(item => filterCountry ? item.country === filterCountry : true)
      .filter(item => filterGender ? item.gender === filterGender : true)
      .filter(item => filterVaazCenter ? (item.pass_preferences && item.pass_preferences[0]?.vaaz_center_name === filterVaazCenter) : true); // Filter by vaaz_center_name
  }, [data, searchTerm, filterCountry, filterGender, filterVaazCenter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const uniqueCountries = useMemo(() => {
    const countries = new Set(data.map(item => item.country));
    return Array.from(countries).sort();
  }, [data]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading user data...</p>
        </div>
      </div>
    );
  }
  
  // Simple header for now, can be replaced with the actual DashboardHeader if user prop is correctly passed
  const renderHeader = () => {
    if (currentUser && !userLoading) { // Ensure user is loaded before rendering header with user
      return <Header user={currentUser} />;
    }
    // Fallback header if no user or user is loading
    return (
      <header className="bg-primary text-primary-foreground py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Reports Dashboard</h1>
          {userLoading && <span className="text-sm">Loading user...</span>}
        </div>
      </header>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-foreground">
      {renderHeader()}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-primary-green">Pass Preference Breakdown Report</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Input 
              placeholder="Search by Name or ITS ID..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="lg:col-span-1"
            />
            <Select value={filterCountry} onValueChange={(value) => { setFilterCountry(value === 'all' ? '' : value); setCurrentPage(1); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {uniqueCountries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterGender} onValueChange={(value) => { setFilterGender(value === 'all' ? '' : value); setCurrentPage(1); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem> 
              </SelectContent>
            </Select>
            <Select value={filterVaazCenter} onValueChange={(value) => { setFilterVaazCenter(value === 'all' ? '' : value); setCurrentPage(1); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Vaaz Center" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vaaz Centers</SelectItem>
                <SelectItem value="MCZ - Mufaddal Centre">MCZ - Mufaddal Centre</SelectItem>
                <SelectItem value="CMZ - Central Masjid Zone">CMZ - Central Masjid Zone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600">Loading report data...</p>
            </div>
          )}
          {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}
          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ITS ID</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Jamaat</TableHead>
                      <TableHead>Vaaz Center</TableHead> {/* New column */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item) => (
                        <TableRow key={item.its_id}>
                          <TableCell>{item.its_id}</TableCell>
                          <TableCell>{item.fullname}</TableCell>
                          <TableCell>{item.gender}</TableCell>
                          <TableCell>{item.age}</TableCell>
                          <TableCell>{item.country}</TableCell>
                          <TableCell>{item.jamaat}</TableCell>
                          <TableCell>{item.pass_preferences && item.pass_preferences?.[0] ? item.pass_preferences?.[0].vaaz_center_name : 'N/A'}</TableCell> {/* Display vaaz_center_name */}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">No data matches your filters.</TableCell> {/* Updated colSpan */}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages} (Total: {filteredData.length} records)
                  </span>
                  <div className="flex items-center space-x-1">
                    <Button variant="outline" size="icon" onClick={() => handlePageChange(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                    {/* Page numbers could be added here for more complex pagination */}
                    <span className='p-2'> {currentPage} </span>
                    <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}