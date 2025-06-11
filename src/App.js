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
  const [results, setResults] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [totalCount, setTotalCount] = useState();
  const [endDate, setEndDate] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [totalPages, setTotalPages] = useState(10);
  const [showPopup, setShowPopup] = useState(false); // New state for popup

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

  // New function to show leads pulled popup
  const handleShowLeadsPulled = () => {
    setShowPopup(true);
  };

  // New function to close popup
  const closePopup = () => {
    setShowPopup(false);
  };

  const handleExportCSV = () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to export.');
      return;
    }
  
    const selectedUsersData = users.filter(user => selectedUsers.includes(user._id));
    
    const csvHeaders = ['First Name,Last Name,Email,Address,State,Phone,Lead Source,Lead Quality','Credit Score:'];
    
    if(selectedUsersData?.exit_url){
      csvHeaders.push('Exit_url')
    }
    if(selectedUsersData?.entry_url){
      csvHeaders.push('Entry_url')
    }

    if(selectedUsersData?.URL){
      csvHeaders.push('URL')
    }

    const csvRows = selectedUsersData.map(user => {
      const baseFields = [
        user?.FirstName ?? '',
        user?.LastName ?? '',
        user?.Email ?? '',
        user?.Address ?? '',
        user?.State ?? '',
        user?.Phone ?? '',
        `"${(user?.URL ?? '').replace(/"/g, '""')}"`, 
        user?.LeadSource ?? '',
        user?.LeadQuality ?? '',
        user?.Credit_score ?? ''
      ];
    
      const optionalFields = [];
      if ('exit_url' in user) optionalFields.push(`"${(user?.exit_url ?? '').replace(/"/g, '""')}"`);
      if ('entry_url' in user) optionalFields.push(`"${(user?.entry_url ?? '').replace(/"/g, '""')}"`);
      if ('URL' in user) optionalFields.push(`"${(user?.URL ?? '').replace(/"/g, '""')}"`);
      return [...baseFields, ...optionalFields].join(',');
    });
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

  const handleFileUpload = async (event) => {
    setLoading(true);
    const file = event.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('csvFile', file);
  
    try {
      const response = await axios.post('https://dataenrichment.vercel.app/enrichifystatcounter', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      setResults(response.data.results)
      console.log(response.data);
      
      if (response.data.results && response.data.results.length > 0) {
        const csvData = convertToCSV(response.data.results);
        
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'enriched-data.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('CSV file processed and downloaded successfully!');
      } else {
        alert('No data to download');
      }
  
      fetchCount();
      fetchLeads();
  
    } catch (error) {
      setLoading(false);
      console.error('Error uploading CSV:', error);
      alert('Error uploading CSV file');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };
  
  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    
    const rows = data.map(obj => 
      headers.map(header => {
        let value = obj[header] || '';
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""');
          if (value.includes(',')) {
            return `"${value}"`;
          }
        }
        return value;
      }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
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
      { label: 'Address:', value: user.Address },
      { label: 'State:', value: user.State },
      { label: 'Phone:', value: user.Phone },        
      { label: 'Lead Source:', value: user.LeadSource },
      { label: 'Lead Quality:', value: user.LeadQuality },
      { label: 'Credit Score:', value: user.Credit_score },
    ];

    if(user?.entry_url){
      let entry_data={ label: 'Entry_url', value: user.entry_url }
      details.push(entry_data)
    }

    if(user?.exit_url){
      let entry_data={ label: 'Exit_url', value: user.exit_url }
      details.push(entry_data)
    }

    if(user?.URL){
      let entry_data= { label: 'URL:', value: user.URL }
      details.push(entry_data)
    }

    details.forEach(({ label, value }) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 15, yPosition);
      doc.setFont(undefined, 'normal');

      if (label === 'URL:') {
        const maxWidth = 140; 
        const urlLines = doc.splitTextToSize(value, maxWidth);
        
        urlLines.forEach((line, index) => {
          doc.text(line, 60, yPosition + (index * lineHeight));
        });
        
        yPosition += (urlLines.length * lineHeight) + 4;
      } else {
        doc.text(value, 60, yPosition);
        yPosition += lineHeight + 4;
      }
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

  const reuploadFile=async(e)=>{
    try{
      let file=e.target.files[0]
      const formData = new FormData();
      formData.append('csvFile', file);
  
      const response = await axios.post('https://dataenrichment.vercel.app/reuploadfile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("File uploaded sucessfully")
    }catch(e){
      alert("Error in the lead process")
      console.log(e.message)
    }
  }

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

            <button 
              onClick={() => document.getElementById('csvInput').click()}
              className="export-button"
            >
              Upload CSV File
            </button>
            <input
              type="file"
              id="csvInput"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            
            <button onClick={handleShowLeadsPulled} className="export-button">
              Show Leads Pulled
            </button>

            <button 
              onClick={() => document.getElementById('reuploadInput').click()}
              className="export-button"
            >
              Reupload file
            </button>
            <input
              type="file"
              id="reuploadInput"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={reuploadFile}
            />
          </div>
          <div className="results-count">
            Showing {users?.length} results
          </div>
          <div className="results-count">
            Total {totalCount} Leads
          </div>
        </div>

        {/* Popup Modal */}
        {showPopup && (
          <div className="popup-overlay" onClick={closePopup}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <div className="popup-header">
                <h3>Leads Pulled Information</h3>
                <button className="close-button" onClick={closePopup}>×</button>
              </div>
              <div className="popup-body">
                <p>Total leads pulled from last CSV upload: <strong>{results.length}</strong></p>
                {results.length > 0 && (
                  <div className="results-preview">
                    <p>Sample data preview:</p>
                    <ul>
                      {results.slice(0, 3).map((result, index) => (
                        <li key={index}>
                          {Object.keys(result).slice(0, 3).map(key => `${key}: ${result[key]}`).join(', ')}
                          {Object.keys(result).length > 3 && '...'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-widget">
            <div className="spinner"></div>
          </div>
        ) : (
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
                      {user?.URL && (
                        <a href={user.URL} target="_blank" rel="noopener noreferrer">
                          View URL
                        </a>
                      )}
                      {user?.entry_url && (
                        <a href={user?.entry_url} target="_blank" rel="noopener noreferrer">
                          View entry_url
                        </a>
                      )}
                      {user.exit_url && (
                        <a href={user.URL ? user.URL : user?.exit_url ? user?.exit_url : ''} target="_blank" rel="noopener noreferrer">
                          View exit_url
                        </a>
                      )}
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
        )}

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
      </div>
    </div>
  );
}

export default App;