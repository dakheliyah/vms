'use client';

import { useState } from 'react';
import Header from '@/components/DashboardHeader';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Lock, 
  Unlock, 
  FileText, 
  Upload, 
  Download, 
  Search,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  Plus
} from 'lucide-react';
import useCurrentUser from '@/lib/hooks/useCurrentUser';
import Link from 'next/link';

export default function AdminPage() {
  const { user: currentUser, isLoading: loading, error, showAccessDenied, countdown } = useCurrentUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkItsNumbers, setBulkItsNumbers] = useState('');  
  const [bulkLockAction, setBulkLockAction] = useState<'lock' | 'unlock'>('lock');
  const [bulkLockReason, setBulkLockReason] = useState('');
  
  // Bulk allocation states
  const [showBulkAllocationModal, setShowBulkAllocationModal] = useState(false);
  const [allocationItsNumbers, setAllocationItsNumbers] = useState('');
  const [allocationGender, setAllocationGender] = useState<'male' | 'female'>('male');
  const [allocationVenue, setAllocationVenue] = useState<'cmz' | 'mcz'>('cmz');
  const [allocationReason, setAllocationReason] = useState('');

  // Import users states
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // New Event modal states
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventStatus, setNewEventStatus] = useState<'active' | 'inactive'>('active');

  // New Vaaz Center modal states
  const [showNewVaazCenterModal, setShowNewVaazCenterModal] = useState(false);
  const [newVaazCenterName, setNewVaazCenterName] = useState('');
  const [newVaazCenterEstCapacity, setNewVaazCenterEstCapacity] = useState('');
  const [newVaazCenterEventId, setNewVaazCenterEventId] = useState('');
  const [newVaazCenterMaleCapacity, setNewVaazCenterMaleCapacity] = useState('');
  const [newVaazCenterFemaleCapacity, setNewVaazCenterFemaleCapacity] = useState('');
  const [events, setEvents] = useState<Array<{id: number, name: string, status: string}>>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dummy data for demonstration
  const dummyUsers = [
    { id: '1', its_id: '12345678', fullname: 'John Doe', status: 'active', lastLogin: '2024-01-15' },
    { id: '2', its_id: '87654321', fullname: 'Jane Smith', status: 'locked', lastLogin: '2024-01-10' },
    { id: '3', its_id: '11223344', fullname: 'Ahmed Ali', status: 'active', lastLogin: '2024-01-14' },
    { id: '4', its_id: '44332211', fullname: 'Fatima Khan', status: 'inactive', lastLogin: '2024-01-05' },
  ];

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === dummyUsers.length ? [] : dummyUsers.map(u => u.id));
  };

  const handleBulkAction = () => {
    // Placeholder for bulk action implementation
    console.log('Performing bulk action:', bulkAction, 'on users:', selectedUsers);
  };

  const handleBulkLockSubmit = async () => {
    if (!bulkItsNumbers.trim()) {
      alert('Please enter at least one ITS number');
      return;
    }

    if (!bulkLockReason.trim()) {
      alert('Please enter a reason for this action');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Parse ITS numbers from textarea (handle both newline and comma-separated formats)
      let itsNumbersArray: string[] = [];
      
      // Check if input contains commas (CSV format)
      if (bulkItsNumbers.includes(',')) {
        itsNumbersArray = bulkItsNumbers
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
      } else {
        // Default to newline-separated format
        itsNumbersArray = bulkItsNumbers
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      }

      if (itsNumbersArray.length === 0) {
        alert('Please enter valid ITS numbers');
        setIsSubmitting(false);
        return;
      }

      // Prepare API payload
      const payload = {
        its_ids: itsNumbersArray,
        is_locked: bulkLockAction === 'lock',
        reason: bulkLockReason.trim()
      };

      const its_no = localStorage.getItem('its_no');

      // Make API call
      const response = await fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/pass-preferences/lock-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Token': `${its_no}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('API response:', result);
      
      // Reset form and close modal
      setBulkItsNumbers('');
      setBulkLockAction('lock');
      setBulkLockReason('');
      setShowBulkModal(false);
      
      alert(`Successfully ${bulkLockAction}ed ${itsNumbersArray.length} users`);
      
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      alert('Error performing bulk operation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAllocationSubmit = async () => {
    if (!allocationItsNumbers.trim()) {
      alert('Please enter at least one ITS number');
      return;
    }

    if (!allocationReason.trim()) {
      alert('Please enter a reason for this allocation');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Parse ITS numbers from textarea (handle both newline and comma-separated formats)
      let itsNumbersArray: string[] = [];
      
      // Check if input contains commas (CSV format)
      if (allocationItsNumbers.includes(',')) {
        itsNumbersArray = allocationItsNumbers
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
      } else {
        // Default to newline-separated format
        itsNumbersArray = allocationItsNumbers
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      }

      if (itsNumbersArray.length === 0) {
        alert('Please enter valid ITS numbers');
        setIsSubmitting(false);
        return;
      }

      // Prepare API payload
      const payload = {
        event_id: 1,
        vaaz_center_id: allocationVenue === 'cmz' ? 1 : 2,
        its_ids: itsNumbersArray,
        gender: allocationGender,
        reason: allocationReason.trim()
      };

      const its_id = localStorage.getItem('its_no');

      // Make API call
      const response = await fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/pass-preferences/bulk-assign-vaaz-center', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Token': `${its_id}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('API response:', result);
      
      // Reset form and close modal
      setAllocationItsNumbers('');
      setAllocationGender('male');
      setAllocationVenue('cmz');
      setAllocationReason('');
      setShowBulkAllocationModal(false);
      
      alert(`Successfully allocated ${itsNumbersArray.length} users to ${allocationVenue.toUpperCase()}`);
      
    } catch (error) {
      console.error('Error performing bulk allocation:', error);
      alert('Error performing bulk allocation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportUsers = async () => {
    if (!selectedFile) {
      alert('Please select a CSV file to import');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const its_no = localStorage.getItem('its_no');
      
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Make API call
      const response = await fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/mumineen/bulk', {
        method: 'POST',
        headers: {
          'Token': `${its_no}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Import API response:', result);
      
      // Reset form and close modal
      setSelectedFile(null);
      setShowImportModal(false);
      
      alert('Users imported successfully!');
      
    } catch (error) {
      console.error('Error importing users:', error);
      alert('Error importing users. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid CSV file');
      event.target.value = '';
    }
  };

  const downloadSampleCSV = () => {
    // Create a link to download the sample CSV from the root folder
    const link = document.createElement('a');
    link.href = '/sample_csv.csv';
    link.download = 'sample_csv.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fetch events for dropdown
  const fetchEvents = async () => {
    try {
      const its_no = localStorage.getItem('its_no');
      const response = await fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Token': `${its_no}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const eventsData = await response.json();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Handle new event submission
  const handleNewEventSubmit = async () => {
    if (!newEventName.trim()) {
      alert('Please enter an event name');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const its_no = localStorage.getItem('its_no');
      const payload = {
        name: newEventName.trim(),
        status: newEventStatus
      };

      const response = await fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': `${its_no}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('New event created:', result);
      
      // Reset form and close modal
      setNewEventName('');
      setNewEventStatus('active');
      setShowNewEventModal(false);
      
      alert('Event created successfully!');
      
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle new vaaz center submission
  const handleNewVaazCenterSubmit = async () => {
    if (!newVaazCenterName.trim()) {
      alert('Please enter a vaaz center name');
      return;
    }
    if (!newVaazCenterEstCapacity || isNaN(Number(newVaazCenterEstCapacity))) {
      alert('Please enter a valid estimated capacity');
      return;
    }
    if (!newVaazCenterEventId) {
      alert('Please select an event');
      return;
    }
    if (!newVaazCenterMaleCapacity || isNaN(Number(newVaazCenterMaleCapacity))) {
      alert('Please enter a valid male capacity');
      return;
    }
    if (!newVaazCenterFemaleCapacity || isNaN(Number(newVaazCenterFemaleCapacity))) {
      alert('Please enter a valid female capacity');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const its_no = localStorage.getItem('its_no');
      const payload = {
        name: newVaazCenterName.trim(),
        est_capacity: Number(newVaazCenterEstCapacity),
        male_capacity: Number(newVaazCenterMaleCapacity),
        female_capacity: Number(newVaazCenterFemaleCapacity),
        lat: 0,
        long: 0,
        event_id: Number(newVaazCenterEventId)
      };

      const response = await fetch('https://vms-api-main-branch-zuipth.laravel.cloud/api/vaaz-center', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': `${its_no}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('New vaaz center created:', result);
      
      // Reset form and close modal
      setNewVaazCenterName('');
      setNewVaazCenterEstCapacity('');
      setNewVaazCenterEventId('');
      setNewVaazCenterMaleCapacity('');
      setNewVaazCenterFemaleCapacity('');
      setShowNewVaazCenterModal(false);
      
      alert('Vaaz center created successfully!');
      
    } catch (error) {
      console.error('Error creating vaaz center:', error);
      alert('Error creating vaaz center. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'locked':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><Lock className="w-3 h-3 mr-1" />Locked</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (showAccessDenied) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-20">
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="text-red-600 text-xl font-semibold mb-4">
              Access Denied
            </div>
            <div className="text-red-700 mb-6">
              You don't have permission to access the admin panel.
            </div>
            <div className="text-red-600 font-medium">
              Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Error loading admin panel. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={currentUser} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage users, perform bulk operations, and access reports</p>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="bg-gradient-to-br from-[#FFF6E7] to-[#EBE3D6] border-[#D9C9AD] shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center text-2xl font-bold">
                <div className="p-3 bg-[#23476B] rounded-lg mr-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-[#23476B]">User Operations</div>
                  <div className="text-sm font-normal text-[#23476B]/70 mt-1">Manage users and perform bulk operations</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button 
                  className="justify-center h-20 text-sm bg-white hover:bg-[#FFF6E7] text-[#23476B] border-[#D9C9AD] shadow-sm flex-col"
                  onClick={() => setShowImportModal(true)}
                >
                  <div className="p-2 bg-[#D9C9AD] rounded-lg mb-2">
                    <Upload className="w-5 h-5 text-[#23476B]" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-xs">Import Users</div>
                  </div>
                </Button>
                <Button 
                  className="justify-center h-20 text-sm bg-white hover:bg-[#FFF6E7] text-[#23476B] border-[#D9C9AD] shadow-sm flex-col"
                  onClick={() => setShowBulkModal(true)}
                >
                  <div className="p-2 bg-[#D9C9AD] rounded-lg mb-2">
                    <Settings className="w-5 h-5 text-[#23476B]" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-xs">Bulk Lock/Unlock</div>
                  </div>
                </Button>
                <Button 
                  className="justify-center h-20 text-sm bg-white hover:bg-[#FFF6E7] text-[#23476B] border-[#D9C9AD] shadow-sm flex-col"
                  onClick={() => setShowBulkAllocationModal(true)}
                >
                  <div className="p-2 bg-[#D9C9AD] rounded-lg mb-2">
                    <Users className="w-5 h-5 text-[#23476B]" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-xs">Bulk Allocate</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#FFF6E7] to-[#EBE3D6] border-[#D9C9AD] shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center text-2xl font-bold">
                <div className="p-3 bg-[#23476B] rounded-lg mr-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-[#23476B]">Reports & Analytics</div>
                  <div className="text-sm font-normal text-[#23476B]/70 mt-1">View detailed reports and analytics</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link href="/reports-new" className="block">
                  <Button className="w-full justify-center h-20 text-sm bg-white hover:bg-[#FFF6E7] text-[#23476B] border-[#D9C9AD] shadow-sm flex-col">
                    <div className="p-2 bg-[#D9C9AD] rounded-lg mb-2">
                      <FileText className="w-5 h-5 text-[#23476B]" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-xs">View Reports</div>
                    </div>
                  </Button>
                </Link>
                <Button className="w-full justify-center h-20 text-sm bg-white hover:bg-[#FFF6E7] text-[#23476B] border-[#D9C9AD] shadow-sm flex-col">
                  <div className="p-2 bg-[#D9C9AD] rounded-lg mb-2">
                    <Download className="w-5 h-5 text-[#23476B]" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-xs">Export Data</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#FFF6E7] to-[#EBE3D6] border-[#D9C9AD] shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center text-2xl font-bold">
                <div className="p-3 bg-[#23476B] rounded-lg mr-4">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-[#23476B]">Admin Operations</div>
                  <div className="text-sm font-normal text-[#23476B]/70 mt-1">Manage events and vaaz centers</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  className="justify-center h-20 text-sm bg-white hover:bg-[#FFF6E7] text-[#23476B] border-[#D9C9AD] shadow-sm flex-col"
                  onClick={() => setShowNewEventModal(true)}
                >
                  <div className="p-2 bg-[#D9C9AD] rounded-lg mb-2">
                    <Plus className="w-5 h-5 text-[#23476B]" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-xs">Add New Event</div>
                  </div>
                </Button>
                <Button 
                  className="justify-center h-20 text-sm bg-white hover:bg-[#FFF6E7] text-[#23476B] border-[#D9C9AD] shadow-sm flex-col"
                  onClick={() => {
                    setShowNewVaazCenterModal(true);
                    fetchEvents();
                  }}
                >
                  <div className="p-2 bg-[#D9C9AD] rounded-lg mb-2">
                    <Plus className="w-5 h-5 text-[#23476B]" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-xs">Add New Vaaz Center</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Section - Hidden for now */}
        {/* 
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                User Management
              </span>
              <Badge variant="outline">{dummyUsers.length} users</Badge>
            </CardTitle>
            <CardDescription>
              Search, filter, and manage user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by ITS ID or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Bulk Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lock">Lock Selected</SelectItem>
                    <SelectItem value="unlock">Unlock Selected</SelectItem>
                    <SelectItem value="activate">Activate Selected</SelectItem>
                    <SelectItem value="deactivate">Deactivate Selected</SelectItem>
                    <SelectItem value="export">Export Selected</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleBulkAction}
                  disabled={selectedUsers.length === 0 || !bulkAction}
                  variant="outline"
                >
                  Apply
                </Button>
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === dummyUsers.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead>ITS ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelection(user.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.its_id}</TableCell>
                      <TableCell>{user.fullname}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            {user.status === 'locked' ? (
                              <><Unlock className="w-3 h-3 mr-1" />Unlock</>
                            ) : (
                              <><Lock className="w-3 h-3 mr-1" />Lock</>
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {selectedUsers.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        */}
      </main>

      {/* Bulk Operations Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Bulk User Operations</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBulkModal(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ITS Numbers
                </label>
                <textarea
                  value={bulkItsNumbers}
                  onChange={(e) => setBulkItsNumbers(e.target.value)}
                  placeholder={`Enter ITS numbers, one per line or comma-separated:\n12345678,87654321,11223344 or\n12345678\n87654321\n11223344`}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter one ITS number per line or comma-separated
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action
                </label>
                <Select 
                  value={bulkLockAction} 
                  onValueChange={(value: 'lock' | 'unlock') => setBulkLockAction(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lock">
                      <div className="flex items-center">
                        <Lock className="w-4 h-4 mr-2" />
                        Lock Users
                      </div>
                    </SelectItem>
                    <SelectItem value="unlock">
                      <div className="flex items-center">
                        <Unlock className="w-4 h-4 mr-2" />
                        Unlock Users
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <Input
                  value={bulkLockReason}
                  onChange={(e) => setBulkLockReason(e.target.value)}
                  placeholder="Enter reason for this action"
                  disabled={isSubmitting}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Please provide a reason for this bulk operation
                </p>
              </div>



            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowBulkModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkLockSubmit}
                disabled={isSubmitting || !bulkItsNumbers.trim() || !bulkLockReason.trim()}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `${bulkLockAction === 'lock' ? 'Lock' : 'Unlock'} Users`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Allocation Modal */}
      {showBulkAllocationModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Bulk Allocate Users</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBulkAllocationModal(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ITS Numbers
                </label>
                <textarea
                  value={allocationItsNumbers}
                  onChange={(e) => setAllocationItsNumbers(e.target.value)}
                  placeholder={`Enter ITS numbers, one per line or comma-separated:\n12345678,87654321,11223344 or\n12345678\n87654321\n11223344`}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter one ITS number per line or comma-separated
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <Select 
                  value={allocationGender} 
                  onValueChange={(value: 'male' | 'female') => setAllocationGender(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue
                </label>
                <Select 
                  value={allocationVenue} 
                  onValueChange={(value: 'cmz' | 'mcz') => setAllocationVenue(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cmz">CMZ</SelectItem>
                    <SelectItem value="mcz">MCZ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <Input
                  value={allocationReason}
                  onChange={(e) => setAllocationReason(e.target.value)}
                  placeholder="Enter reason for this allocation"
                  disabled={isSubmitting}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Please provide a reason for this bulk allocation
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowBulkAllocationModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkAllocationSubmit}
                disabled={isSubmitting || !allocationItsNumbers.trim() || !allocationReason.trim()}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Allocate Users'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Import Users Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Import Users</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowImportModal(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Please select a CSV file containing user data
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Need a sample format?</h4>
                    <p className="text-xs text-blue-700 mt-1">Download our sample CSV to see the required format</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadSampleCSV}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Sample CSV
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowImportModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImportUsers}
                disabled={isSubmitting || !selectedFile}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </div>
                ) : (
                  'Import Users'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Event Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Add New Event</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNewEventModal(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="Enter event name"
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Status <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={newEventStatus} 
                  onValueChange={(value: 'active' | 'inactive') => setNewEventStatus(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center">
                        <XCircle className="w-4 h-4 mr-2 text-red-500" />
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowNewEventModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNewEventSubmit}
                disabled={isSubmitting || !newEventName.trim()}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Event'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Vaaz Center Modal */}
      {showNewVaazCenterModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Add New Vaaz Center</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNewVaazCenterModal(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newVaazCenterName}
                  onChange={(e) => setNewVaazCenterName(e.target.value)}
                  placeholder="Enter vaaz center name"
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Est Capacity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={newVaazCenterEstCapacity}
                  onChange={(e) => setNewVaazCenterEstCapacity(e.target.value)}
                  placeholder="Enter estimated capacity"
                  disabled={isSubmitting}
                  className="w-full"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={newVaazCenterEventId} 
                  onValueChange={setNewVaazCenterEventId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{event.name}</span>
                          <Badge 
                            variant={event.status === 'active' ? 'default' : 'secondary'}
                            className="ml-2"
                          >
                            {event.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Male Capacity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={newVaazCenterMaleCapacity}
                  onChange={(e) => setNewVaazCenterMaleCapacity(e.target.value)}
                  placeholder="Enter male capacity"
                  disabled={isSubmitting}
                  className="w-full"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Female Capacity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={newVaazCenterFemaleCapacity}
                  onChange={(e) => setNewVaazCenterFemaleCapacity(e.target.value)}
                  placeholder="Enter female capacity"
                  disabled={isSubmitting}
                  className="w-full"
                  min="0"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowNewVaazCenterModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNewVaazCenterSubmit}
                disabled={isSubmitting || !newVaazCenterName.trim() || !newVaazCenterEstCapacity || !newVaazCenterEventId || !newVaazCenterMaleCapacity || !newVaazCenterFemaleCapacity}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Vaaz Center'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}