'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/DashboardHeader'; // Assuming a generic header, adjust if needed
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For potential filters
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, Download } from 'lucide-react';
import useCurrentUser from '@/lib/hooks/useCurrentUser'; // Re-using for consistency if user context is needed
import Papa from 'papaparse';

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
  const [filterAge, setFilterAge] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('1'); // New state for event selection
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'its_id', 'fullname', 'gender', 'age', 'country', 'jamaat', 'vaaz_center'
  ]);

  // Consistent user fetching, though not directly used for data display yet
  const { user: currentUser, isLoading: userLoading, error: userError } = useCurrentUser();

  // Available columns for export
  const availableColumns = [
    { key: 'its_id', label: 'ITS ID' },
    { key: 'fullname', label: 'Full Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'age', label: 'Age' },
    { key: 'country', label: 'Country' },
    { key: 'jamaat', label: 'Jamaat' },
    { key: 'vaaz_center', label: 'Vaaz Center' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'idara', label: 'Idara' },
    { key: 'category', label: 'Category' },
    { key: 'prefix', label: 'Prefix' },
    { key: 'title', label: 'Title' },
    { key: 'venue_waaz', label: 'Venue Waaz' },
    { key: 'city', label: 'City' },
    { key: 'local_mehman', label: 'Local Mehman' },
    { key: 'arr_place_date', label: 'Arrival Place Date' },
    { key: 'flight_code', label: 'Flight Code' },
    { key: 'whatsapp_link_clicked', label: 'WhatsApp Link Clicked' },
    { key: 'daily_trans', label: 'Daily Trans' },
    { key: 'acc_arranged_at', label: 'Accommodation Arranged At' },
    { key: 'acc_zone', label: 'Accommodation Zone' },
    { key: 'created_at', label: 'Created At' },
    { key: 'updated_at', label: 'Updated At' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Get current user
      const user = localStorage.getItem('its_no');

      try {
        // Add header token to this
        const response = await fetch(`https://vms-api-main-branch-zuipth.laravel.cloud/api/mumineen/pass-preference/breakdown?event_id=${selectedEventId}`, {
            headers: {
                'Token': user || '',
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
  }, [selectedEventId]);

  const filteredData = useMemo(() => {
    return data
      .filter(item => 
        item.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.its_id.toString().includes(searchTerm)
      )
      .filter(item => filterCountry ? item.country === filterCountry : true)
      .filter(item => filterGender ? item.gender === filterGender : true)
      .filter(item => {
        if (!filterVaazCenter) return true;
        const vaazCenter = item.pass_preferences?.[0]?.vaaz_center_name;
        if (filterVaazCenter === 'N/A') {
          return !vaazCenter;
        }
        return vaazCenter === filterVaazCenter;
      })
      .filter(item => {
        if (!filterAge) return true;
        return item.age.toString().includes(filterAge);
      });
  }, [data, searchTerm, filterCountry, filterGender, filterVaazCenter, filterAge]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const uniqueCountries = useMemo(() => {
    const countries = new Set(data.map(item => item.country));
    return Array.from(countries).sort();
  }, [data]);

  const uniqueVaazCenters = useMemo(() => {
    const vaazCenters = new Set<string>();
    data.forEach(item => {
      const vaazCenter = item.pass_preferences?.[0]?.vaaz_center_name;
      if (vaazCenter) {
        vaazCenters.add(vaazCenter);
      } else {
        vaazCenters.add('N/A');
      }
    });
    return Array.from(vaazCenters).sort();
  }, [data]);

  const venueStats = useMemo(() => {
    const stats = {
      total: data.length,
      byVenue: {} as Record<string, number>,
      byGender: {
        male: 0,
        female: 0
      },
      byVenueAndGender: {} as Record<string, {
        male: number,
        female: number
      }>
    };

    data.forEach(item => {
      // Venue stats
      const venueName = item.pass_preferences?.[0]?.vaaz_center_name || 'Unassigned';
      stats.byVenue[venueName] = (stats.byVenue[venueName] || 0) + 1;

      // Gender stats
      const genderKey = item.gender.toLowerCase() as 'male' | 'female';
      if (genderKey === 'male' || genderKey === 'female') {
        stats.byGender[genderKey] = (stats.byGender[genderKey] || 0) + 1;

        // Venue and Gender combined stats
        if (!stats.byVenueAndGender[venueName]) {
          stats.byVenueAndGender[venueName] = {
            male: 0,
            female: 0
          };
        }
        stats.byVenueAndGender[venueName][genderKey]++;
      }
    });

    return stats;
  }, [data]);

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(col => col !== columnKey)
        : [...prev, columnKey]
    );
  };

  const exportToCSV = () => {
    const exportData = filteredData.map(item => {
      const row: any = {};
      selectedColumns.forEach(column => {
        switch (column) {
          case 'its_id':
            row['ITS ID'] = item.its_id;
            break;
          case 'fullname':
            row['Full Name'] = item.fullname;
            break;
          case 'gender':
            row['Gender'] = item.gender;
            break;
          case 'age':
            row['Age'] = item.age;
            break;
          case 'country':
            row['Country'] = item.country;
            break;
          case 'jamaat':
            row['Jamaat'] = item.jamaat;
            break;
          case 'vaaz_center':
            row['Vaaz Center'] = item.pass_preferences?.[0]?.vaaz_center_name || 'N/A';
            break;
          case 'mobile':
            row['Mobile'] = item.mobile || 'N/A';
            break;
          case 'idara':
            row['Idara'] = item.idara || 'N/A';
            break;
          case 'category':
            row['Category'] = item.category || 'N/A';
            break;
          case 'prefix':
            row['Prefix'] = item.prefix || 'N/A';
            break;
          case 'title':
            row['Title'] = item.title || 'N/A';
            break;
          case 'venue_waaz':
            row['Venue Waaz'] = item.venue_waaz || 'N/A';
            break;
          case 'city':
            row['City'] = item.city || 'N/A';
            break;
          case 'local_mehman':
            row['Local Mehman'] = item.local_mehman ? 'Yes' : 'No';
            break;
          case 'arr_place_date':
            row['Arrival Place Date'] = item.arr_place_date || 'N/A';
            break;
          case 'flight_code':
            row['Flight Code'] = item.flight_code || 'N/A';
            break;
          case 'whatsapp_link_clicked':
            row['WhatsApp Link Clicked'] = item.whatsapp_link_clicked ? 'Yes' : 'No';
            break;
          case 'daily_trans':
            row['Daily Trans'] = item.daily_trans ? 'Yes' : 'No';
            break;
          case 'acc_arranged_at':
            row['Accommodation Arranged At'] = item.acc_arranged_at || 'N/A';
            break;
          case 'acc_zone':
            row['Accommodation Zone'] = item.acc_zone || 'N/A';
            break;
          case 'created_at':
            row['Created At'] = new Date(item.created_at).toLocaleDateString();
            break;
          case 'updated_at':
            row['Updated At'] = new Date(item.updated_at).toLocaleDateString();
            break;
        }
      });
      return row;
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pass-preference-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDialog(false);
  };

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
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-primary-green">Pass Preference Breakdown Report</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border-2 border-blue-200 shadow-sm w-full sm:w-auto">
              <label htmlFor="event-select" className="text-sm sm:text-base font-semibold text-blue-800 whitespace-nowrap">Report Type:</label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger className="w-full sm:w-56 h-10 sm:h-12 bg-white border-2 border-blue-300 hover:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-gray-800">
                  <SelectValue placeholder="Select report type" className="font-medium" />
                </SelectTrigger>
                <SelectContent className="border-2 border-blue-200 shadow-xl">
                  <SelectItem value="1" className="font-medium hover:bg-blue-50 focus:bg-blue-100 py-3">📊 Waaz Reports</SelectItem>
                  <SelectItem value="2" className="font-medium hover:bg-blue-50 focus:bg-blue-100 py-3">🌙 Pehli Raat Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Venue Statistics</h3>
              <div className="space-y-2">
                {Object.entries(venueStats.byVenue).map(([venue, count]) => (
                  <div key={venue}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{venue}:</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="pl-4 text-sm space-y-1">
                      {Object.entries(venueStats.byVenueAndGender[venue] || {}).map(([gender, genderCount]) => (
                        <div key={`${venue}-${gender}`} className="flex justify-between text-gray-600">
                          <span className="capitalize">{gender}:</span>
                          <span>{genderCount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Overall Gender Distribution</h3>
              <div className="space-y-2">
                {Object.entries(venueStats.byGender).map(([gender, count]) => (
                  <div key={gender} className="flex justify-between">
                    <span className="capitalize">{gender}:</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 flex-1">
              <Input 
                placeholder="Search by Name or ITS ID..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="lg:col-span-1"
              />
              <Input 
                placeholder="Filter by Age..."
                value={filterAge}
                onChange={(e) => { setFilterAge(e.target.value); setCurrentPage(1); }}
                className="lg:col-span-1"
                type="number"
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
                </SelectContent>
              </Select>
              <Select value={filterVaazCenter} onValueChange={(value) => { setFilterVaazCenter(value === 'all' ? '' : value); setCurrentPage(1); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by Vaaz Center" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vaaz Centers</SelectItem>
                  {uniqueVaazCenters.map(vaazCenter => (
                    <SelectItem key={vaazCenter} value={vaazCenter}>{vaazCenter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {currentUser?.its_id == '30361114' || currentUser?.its_id == '30361286' || currentUser?.its_id == '30359366' || currentUser?.its_id == '30362306' ? (
            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="ml-4">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Select Columns to Export</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {availableColumns.map(column => (
                      <div key={column.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={column.key}
                          checked={selectedColumns.includes(column.key)}
                          onCheckedChange={() => handleColumnToggle(column.key)}
                        />
                        <label htmlFor={column.key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {column.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedColumns(availableColumns.map(col => col.key))}
                    >
                      Select All
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedColumns([])}
                    >
                      Clear All
                    </Button>
                  </div>
                  <Button 
                    onClick={exportToCSV} 
                    disabled={selectedColumns.length === 0}
                    className="w-full"
                  >
                    Download CSV ({selectedColumns.length} columns)
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            ) : (
              null
            )}
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