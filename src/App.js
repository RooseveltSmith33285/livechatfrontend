import { useEffect, useState } from 'react';
import './App.css';
import jsPDF from 'jspdf';
import axios from 'axios';


 const RenderDataZappTab = () => {
    const [processedData, setProcessedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const downloadCSVtwo = (data, filename = 'processed_data.csv') => {
      const csvContent = convertToCSVTwo(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  

    const convertToCSVTwo = (data) => {
      if (!data || data.length === 0) return '';
      
      // Get all unique keys from all objects (in case some objects have different fields)
      const allKeys = [...new Set(data.flatMap(obj => Object.keys(obj)))];
      
      // Create header row
      const header = allKeys.join(',');
      
      // Create data rows
      const rows = data.map(obj => {
        return allKeys.map(key => {
          const value = obj[key];
          // Handle null, undefined, objects, arrays
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          // Escape commas and quotes in strings
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',');
      });
      
      return [header, ...rows].join('\n');
    };
    
    
    const handleDataZappUpload = async (event) => {
      setLoading(true);
      const file = event.target.files[0];
      if (!file) {
        setLoading(false);
        return;
      }
    
      const formData = new FormData();
      formData.append('dataZappFile', file);
    
      try {
        const response = await axios.post('http://localhost:5000/upload-datazapp', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        let result=response.data;
        alert('DataZapp file uploaded successfully!');
        if (result.data && result.data.length > 0) {
          const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
          const filename = `processed_datazapp_${timestamp}.csv`;
          downloadCSVtwo(result.data, filename);
          
          // Optional: Show success notification
          alert(`File processed successfully! ${result.data.length} records processed. CSV download started.`);
        }
      } catch (error) {
        console.error('Error uploading DataZapp file:', error);
        alert('Error uploading DataZapp file');
      } finally {
        setLoading(false);
        event.target.value = ''; // Reset the file input
      }
    };
    
    return (
      <div className="upload-section">
        <div className="upload-container">
          <h2>Upload DataZapp Files</h2>
          <p>Select and upload your DataZapp files for processing.</p>
          
          <div className="upload-buttons">
            <div className="upload-option">
              <button 
                onClick={() => document.getElementById('dataZappInput').click()}
                className="upload-button primary"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Upload & Process DataZapp File'}
              </button>
              <input
                type="file"
                id="dataZappInput"
                accept=".csv,.xlsx"
                style={{ display: 'none' }}
                onChange={handleDataZappUpload}
              />
            </div>
            
            {/* Optional: Manual download button if you want to store the data */}
            {processedData && (
              <div className="upload-option">
                <button 
                  onClick={() => downloadCSVtwo(processedData, 'processed_datazapp.csv')}
                  className="upload-button secondary"
                >
                  Download Processed CSV
                </button>
              </div>
            )}
          </div>
  
          {loading && (
            <div className="loading-widget">
              <div className="spinner"></div>
              <p>Processing your file Please wait...</p>
              <small>This may take a few moments for large files.</small>
            </div>
          )}
  
          {/* Optional: Show processing summary */}
          {processedData && (
            <div className="processing-summary">
              <h3>Processing Complete!</h3>
              <p>✅ {processedData.length} records processed</p>
              <p>✅ CSV file downloaded automatically</p>
            </div>
          )}
        </div>
      </div>
    );
  };



 

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [usersPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [results, setResults] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [activeTab, setActiveTab] = useState('leads'); // Add this with your other state declarations
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

 


  

  
  
 


 
  
  const downloadCSV = (data, filename = 'processed_data.csv') => {
    const csvContent =convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Updated handleDataZappUpload function
  


  

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
  
    // Base headers as separate strings
    const baseHeaders = [
      'First Name',
      'Last Name',
      'Email',
      'Address',
      'State',
      'Lead Source',
      'Lead Quality',
      'Credit Score'
    ];
  
    // Determine which optional headers to include
    const optionalHeaders = [];
    if (selectedUsersData.some(user => 'exit_url' in user)) optionalHeaders.push('Exit_url');
    if (selectedUsersData.some(user => 'entry_url' in user)) optionalHeaders.push('Entry_url');
    if (selectedUsersData.some(user => 'URL' in user)) optionalHeaders.push('URL');
    if (selectedUsersData.some(user => 'Title' in user)) optionalHeaders.push('Title');
    if (selectedUsersData.some(user => 'income' in user)) optionalHeaders.push('income');
    if (selectedUsersData.some(user => 'Phone' in user)) optionalHeaders.push('Phone');
    // Combine all headers
    const headers = [...baseHeaders, ...optionalHeaders];
  
    const csvRows = selectedUsersData.map(user => {
      const baseFields = [
        user?.FirstName ?? '',
        user?.LastName ?? '',
        user?.Email ?? '',
        user?.Address ?? '',
        user?.State ?? '',
       "Enrichify",
        "WARM",
        user?.Credit_score ?? ''
      ];
  
      const optionalFields = [];
      if (optionalHeaders.includes('Exit_url')) optionalFields.push(`"${(user?.exit_url ?? '').replace(/"/g, '""')}"`);
      if (optionalHeaders.includes('Entry_url')) optionalFields.push(`"${(user?.entry_url ?? '').replace(/"/g, '""')}"`);
      if (optionalHeaders.includes('URL')) optionalFields.push(`"${(user?.URL ?? '').replace(/"/g, '""')}"`);
      if (optionalHeaders.includes('Title')) optionalFields.push(`"${(user?.Title ?? '').replace(/"/g, '""')}"`);
      if (optionalHeaders.includes('income')) optionalFields.push(`"${(user?.income ?? '').replace(/"/g, '""')}"`);
      if (optionalHeaders.includes('Phone')) optionalFields.push(`"${(user?.Phone ?? '').replace(/"/g, '""')}"`);
      
      return [...baseFields, ...optionalFields];
    });
  
    const csvContent = [
      headers.join(','),  // Header row
      ...csvRows.map(row => row.join(','))  // Data rows
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${new Date().toISOString().slice(0,10)}.csv`);
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
      const response = await axios.post('http://localhost:5000/enrichifystatcounter', formData, {
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
      if(error?.response?.data?.error){

        alert(error?.response?.data?.error);
      }else{
        alert("Something went wrong")
      }
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
      { label: 'Lead Source:', value: user.LeadSource },
      { label: 'Lead Quality:', value: user.LeadQuality },
      { label: 'Credit Score:', value: user.Credit_score },
    ];

    if(user?.entry_url){
      let entry_data = { label: 'Entry URL:', value: user.entry_url, isUrl: true }
      details.push(entry_data)
    }

    if(user?.exit_url){
      let exit_data = { label: 'Exit URL:', value: user.exit_url, isUrl: true }
      details.push(exit_data)
    }

    if(user?.URL){
      let url_data = { label: 'URL:', value: user.URL, isUrl: true }
      details.push(url_data)
    }

    if(user?.Title){
      let title_data = { label: 'Title:', value: user.Title }
      details.push(title_data)
    }

    if(user?.income){
      let income_data = { label: 'Income:', value: user.income }
      details.push(income_data)
    }

    if(user?.Phone){
      let phone_data = { label: 'Phone:', value: user.Phone }
      details.push(phone_data)
    }

    // Function to check if we need a new page
    const checkPageBreak = (currentY, additionalHeight = 0) => {
      const pageHeight = doc.internal.pageSize.height;
      const bottomMargin = 20;
      
      if (currentY + additionalHeight > pageHeight - bottomMargin) {
        doc.addPage();
        return 20; // Reset to top of new page
      }
      return currentY;
    };

    details.forEach(({ label, value, isUrl }) => {
      // Check if we need a new page before adding content
      yPosition = checkPageBreak(yPosition, 20);
      
      doc.setFont(undefined, 'bold');
      doc.text(label, 15, yPosition);
      doc.setFont(undefined, 'normal');

      // Handle URL fields that need text wrapping
      if (isUrl && value) {
        const maxWidth = 140; // Maximum width for URL text
        const urlLines = doc.splitTextToSize(value, maxWidth);
        
        // Check if we need a new page for the URL content
        const urlHeight = urlLines.length * lineHeight;
        yPosition = checkPageBreak(yPosition, urlHeight);
        
        urlLines.forEach((line, index) => {
          doc.text(line, 60, yPosition + (index * lineHeight));
        });
        
        yPosition += (urlLines.length * lineHeight) + 4;
      } else {
        // Handle regular text fields
        const textValue = value || 'N/A';
        
        // For very long text fields, wrap them too
        if (textValue.length > 50) {
          const maxWidth = 140;
          const textLines = doc.splitTextToSize(textValue, maxWidth);
          
          const textHeight = textLines.length * lineHeight;
          yPosition = checkPageBreak(yPosition, textHeight);
          
          textLines.forEach((line, index) => {
            doc.text(line, 60, yPosition + (index * lineHeight));
          });
          
          yPosition += (textLines.length * lineHeight) + 4;
        } else {
          doc.text(textValue, 60, yPosition);
          yPosition += lineHeight + 4;
        }
      }
    });

    // Add footer to the last page
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, pageHeight - 10);
    
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
      let response=await axios.get(`http://localhost:5000/totalLeads`)
      setTotalCount(response.data.count)
    }catch(e){

    }
  }

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const startIndex = (currentPage - 1) * usersPerPage;
    const response = await axios.get(`http://localhost:5000/leads`, {
      params: { 
        startIndex, 
        pageSize: usersPerPage, 
        startDate, 
        endDate 
      }
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
  
      const response = await axios.post('http://localhost:5000/reuploadfile', formData, {
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

        <div className="business-container">
      <h1 className="business-header">Enrichify Lead System</h1>
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          View Leads
        </button>
        <button 
          className={`tab-button ${activeTab === 'datazapp' ? 'active' : ''}`}
          onClick={() => setActiveTab('datazapp')}
        >
          Upload DataZapp File
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'leads' && (
          <>
            {/* Your existing leads content goes here */}
            <div className="filter-section">
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
                  <th>Title</th>
                  <th>URLs</th>
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
                  <th>
                    Income
                  </th>
                </tr>
              </thead>
              <tbody>
                {users?.map(user => (
                  <tr key={user._id}>
                    <td>{user.FirstName}</td>
                    <td>{user.LastName}</td>
                    <td>{user.Email}</td>
                    <td>{user?.Phone ? user?.Phone : 'N/A'}</td>
                    <td>{user?.Title?user?.Title:'Live'}</td>
                    <td>
                      {user?.URL && (
                        <div>
                          <a href={user.URL} target="_blank" rel="noopener noreferrer">
                            View URL
                          </a>
                        </div>
                      )}
                      {user?.entry_url && (
                        <div>
                          <a href={user?.entry_url} target="_blank" rel="noopener noreferrer">
                            Entry URL
                          </a>
                        </div>
                      )}
                      {user.exit_url && (
                        <div>
                          <a href={user?.exit_url} target="_blank" rel="noopener noreferrer">
                            Exit URL
                          </a>
                        </div>
                      )}
                    </td>
                    <td>{user.LeadSource ? user.LeadSource : 'ENRICHIFY'}</td>
                    <td>
                      <span className={`quality-badge ${user.LeadQuality ? user.LeadQuality.toLowerCase() : 'warm'}`}>
                        {user.LeadQuality ? user.LeadQuality : 'WARM'}
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
                    <td>
                      {user?.income?user?.income:'N/A'}
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
          </>
        )}
        {activeTab === 'datazapp' && <RenderDataZappTab />}
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

        </div>
    </div>
  );
}

export default App;