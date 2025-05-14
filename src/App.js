import { useEffect, useState } from 'react';
import './App.css';
import jsPDF from 'jspdf';
import axios from 'axios';

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [usersPerPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
const [selectAll, setSelectAll] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [totalCount,setTotalCount]=useState()
  const [endDate, setEndDate] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [totalPages, setTotalPages] = useState(10);

  const [users, setUsers] = useState([]);


  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };


  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };


  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      const allUserIds = users.map(user => user._id);
      setSelectedUsers(allUserIds);
    }
    setSelectAll(!selectAll);
  };


  const handleExportCSV = () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to export.');
      return;
    }
  
    const selectedUsersData = users.filter(user => selectedUsers.includes(user._id));
    
 
    const csvHeaders = ['First Name,Last Name,Email,Address,State,Phone,URL,Lead Source,Lead Quality'];
    

    const csvRows = selectedUsersData.map(user => 
      `${user?.FirstName},${user?.LastName},${user?.Email},${user?.Address},${user?.State},${user?.Phone},"${user?.URL}",${user?.LeadSource},${user?.LeadQuality},${user?.Address}`
    );
  
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };




  
  const handleExportLead = (user) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Lead Details', 15, 40);
    doc.setFontSize(12);
    
    const lineHeight = 8;
    let yPosition = 50;
    
    const details = [
      { label: 'First Name:', value: user.FirstName },
      { label: 'Last Name:', value: user.LastName },
      { label: 'Email:', value: user.Email },
      {label:'Address',value:user.Address},
      {label:'State',value:user.State},
      { label: 'Phone:', value: user.Phone },
      { label: 'URL:', value: user.URL },
      { label: 'Lead Source:', value: user.LeadSource },
      { label: 'Lead Quality:', value: user.LeadQuality },
    ];

    details.forEach(({ label, value }) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 15, yPosition);
      doc.setFont(undefined, 'normal');
      doc.text(value, 60, yPosition);
      yPosition += lineHeight + 4;
    });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, doc.internal.pageSize.height - 10);
    doc.save(`lead-${user.FirstName}-${user.LastName}.pdf`);
  };

  useEffect(() => {
    fetchLeads();
  }, [currentPage, startDate, endDate]);

useEffect(()=>{
fetchCount();
},[])

  const fetchCount=async()=>{
    try{
let response=await axios.get(`https://dataenrichment.vercel.app/totalLeads`)

setTotalCount(response.data.count)
    }catch(e){

    }
  }

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const startIndex = (currentPage - 1) * usersPerPage;
      const response = await axios.get(`https://dataenrichment.vercel.app/leads`, {
        params: { startIndex, pageSize: usersPerPage, startDate, endDate }
      });
      
      setUsers(response.data.data);
      setTotalPages(response.data.totalPages);
      setHasMore(response.data.hasMore);
      setTotalCount(response.data.totalCount); 
      setLoading(false)
    } catch (e) {
      console.error('Error fetching leads:', e);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };
  
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };
  return (
    <div className="App">
      <div className="business-container">
        <h1 className="business-header">Enrichify Lead System</h1>
        
        <div className="filter-section">
          <div className="date-filters">
            <div className="filter-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                max={endDate}
              />
            </div>
            <div className="filter-group">
              <label>End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate}
              />
            </div>
            <button onClick={clearFilters} className="clear-button">
              Clear Filters
            </button>

            <button 
      onClick={handleExportCSV}
      disabled={selectedUsers.length === 0}
      className="export-button"
    >
      Export Selected as CSV
    </button>
          </div>
          <div className="results-count">
            Showing {users?.length} results
          </div>
          <div className="results-count">
          Total {totalCount} Leads
          </div>
        </div>
{loading?<>
  <div className="loading-widget">
            <div className="spinner"></div>
            
          </div>
</>:<>

  <div className="table-responsive">
          <table className="business-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>URL</th>
                <th>Lead Source</th>
                <th>Lead Quality</th>
                <th>Export Lead</th>
                <th>
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAll}
          disabled={users.length === 0}
        />
      </th>
              </tr>
            </thead>
            <tbody>
              {users?.map(user => (
                <tr key={user._id}>
                  <td>{user.FirstName}</td>
                  <td>{user.LastName}</td>
                  <td>{user.Email}</td>
                  <td>{user.Phone}</td>
                  <td>
                  <a href={user.URL} target="_blank" rel="noopener noreferrer">
  View URL
</a>

                  </td>
                  <td>{user.LeadSource}</td>
                  <td>
                    <span className={`quality-badge ${user.LeadQuality.toLowerCase()}`}>
                      {user.LeadQuality}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleExportLead(user)}
                      className="export-button"
                    >
                      Export Lead
                    </button>
                  </td>
                  <td>
          <input
            type="checkbox"
            checked={selectedUsers.includes(user._id)}
            onChange={() => handleSelectUser(user._id)}
          />
        </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-controls">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
      onClick={handleNextPage}
      disabled={!hasMore}
    >
      Next
    </button>
        </div>
</>}
      </div>
    </div>
  );
}

export default App;