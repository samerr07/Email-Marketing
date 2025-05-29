// import { useState, useRef, useEffect } from 'react';
// import { X, Upload, Mail, Settings, Send, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

// export default function EmailMarketingTool() {
//     const [activeStep, setActiveStep] = useState(1);
//     const [excelFile, setExcelFile] = useState(null);
//     const [excelFileName, setExcelFileName] = useState('');
//     const [templateFile, setTemplateFile] = useState(null);
//     const [templateFileName, setTemplateFileName] = useState('');
//     const [templateContent, setTemplateContent] = useState('');
//     const [activeTemplateTab, setActiveTemplateTab] = useState('upload');
//     const [excelProgress, setExcelProgress] = useState(0);
//     const [templateProgress, setTemplateProgress] = useState(0);
//     const [uploadExcelDisabled, setUploadExcelDisabled] = useState(true);
//     const [uploadTemplateDisabled, setUploadTemplateDisabled] = useState(true);
//     const [nextToStep2Disabled, setNextToStep2Disabled] = useState(true);
//     const [nextToStep3Disabled, setNextToStep3Disabled] = useState(true);
//     const [excelPreview, setExcelPreview] = useState(null);
//     const [templatePreview, setTemplatePreview] = useState(null);

//     // Excel data state
//     const [excelData, setExcelData] = useState(null);
//     const [totalRows, setTotalRows] = useState(0);
//     const [excelFilePath, setExcelFilePath] = useState('');
//     const [templateFilePath, setTemplateFilePath] = useState('');

//     // SMTP Settings
//     const [smtpServer, setSmtpServer] = useState('');
//     const [smtpPort, setSmtpPort] = useState('587');
//     const [emailUser, setEmailUser] = useState('');
//     const [emailPass, setEmailPass] = useState('');
//     const [senderName, setSenderName] = useState('');
//     const [connectionStatus, setConnectionStatus] = useState('');
//     const [testingConnection, setTestingConnection] = useState(false);

//     // Email Configuration
//     const [emailColumns, setEmailColumns] = useState([]);
//     const [selectedEmailColumn, setSelectedEmailColumn] = useState('');
//     const [selectedNameColumn, setSelectedNameColumn] = useState('');
//     const [subjectLine, setSubjectLine] = useState('');

//     // Variable mappings
//     const [variableMappings, setVariableMappings] = useState([]);
//     const [emailPreviewContent, setEmailPreviewContent] = useState('');

//     // Sending data
//     const [recipientCount, setRecipientCount] = useState(0);
//     const [isSending, setIsSending] = useState(false);
//     const [sendingComplete, setSendingComplete] = useState(false);
//     const [sentCount, setSentCount] = useState(0);
//     const [failedCount, setFailedCount] = useState(0);
//     const [remainingCount, setRemainingCount] = useState(0);
//     const [sendingProgress, setSendingProgress] = useState(0);
//     const [sendingLogs, setSendingLogs] = useState([]);
//     const [delayBetweenEmails, setDelayBetweenEmails] = useState(2000);
//     const [currentJobId, setCurrentJobId] = useState(null);
//     const [statusInterval, setStatusInterval] = useState(null);
//     const [campaignName, setCampaignName] = useState('');

//     // File input refs
//     const excelFileRef = useRef(null);
//     const templateFileRef = useRef(null);

//     // Backend API base URL (adjust as needed)
//     const API_BASE = 'http://localhost:5000';

//     // Handle Excel file selection
//     const handleExcelFileChange = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
//             alert('Please select a valid Excel file (.xlsx or .xls)');
//             e.target.value = '';
//             setExcelFileName('');
//             return;
//         }

//         setExcelFile(file);
//         setExcelFileName(file.name);
//         setUploadExcelDisabled(false);
//     };

//     // Handle template file selection
//     const handleTemplateFileChange = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
//             alert('Please select a valid HTML file (.html or .htm)');
//             e.target.value = '';
//             setTemplateFileName('');
//             return;
//         }

//         setTemplateFile(file);
//         setTemplateFileName(file.name);
//         setUploadTemplateDisabled(false);
//     };

//     // Handle tab switching
//     const handleTemplateTabClick = (tab) => {
//         setActiveTemplateTab(tab);
//     };

//     // Upload Excel file to backend
//     const uploadExcel = async () => {
//         if (!excelFile) return;

//         const formData = new FormData();
//         formData.append('excel', excelFile);

//         try {
//             // Animate progress
//             let progress = 0;
//             const interval = setInterval(() => {
//                 progress += 20;
//                 setExcelProgress(progress);
//                 if (progress >= 80) {
//                     clearInterval(interval);
//                 }
//             }, 100);

//             const response = await fetch(`${API_BASE}/preview-excel`, {
//                 method: 'POST',
//                 body: formData
//             });

//             const result = await response.json();

//             if (result.success) {
//                 // Complete progress
//                 setExcelProgress(100);

//                 // Store data
//                 setExcelData(result);
//                 setTotalRows(result.totalRows);
//                 setRecipientCount(result.totalRows);
//                 setExcelFilePath(result.filePath);

//                 // Set preview
//                 setExcelPreview({
//                     headers: result.headers,
//                     data: result.sample.map(obj => result.headers.map(header => obj[header] || ''))
//                 });

//                 // Set available columns
//                 setEmailColumns(result.headers);

//                 // Auto-detect email column
//                 const emailCol = result.headers.find(header =>
//                     header.toLowerCase().includes('email') || header.toLowerCase().includes('mail')
//                 );
//                 if (emailCol) {
//                     setSelectedEmailColumn(emailCol);
//                 }

//                 // Auto-detect name column
//                 const nameCol = result.headers.find(header =>
//                     header.toLowerCase().includes('name') || header.toLowerCase().includes('first')
//                 );
//                 if (nameCol) {
//                     setSelectedNameColumn(nameCol);
//                 }

//                 checkStep1Complete();
//             } else {
//                 throw new Error(result.message || 'Failed to process Excel file');
//             }
//         } catch (error) {
//             alert('Error uploading Excel file: ' + error.message);
//             setExcelProgress(0);
//         }
//     };

//     // Upload template file to backend
//     const uploadTemplate = async () => {
//         if (!templateFile) return;

//         const formData = new FormData();
//         formData.append('template', templateFile);

//         try {
//             // Animate progress
//             let progress = 0;
//             const interval = setInterval(() => {
//                 progress += 20;
//                 setTemplateProgress(progress);
//                 if (progress >= 80) {
//                     clearInterval(interval);
//                 }
//             }, 100);

//             const response = await fetch(`${API_BASE}/upload-template`, {
//                 method: 'POST',
//                 body: formData
//             });

//             const result = await response.json();

//             if (result.success) {
//                 // Complete progress
//                 setTemplateProgress(100);

//                 setTemplateContent(result.template);
//                 setTemplateFilePath(result.filePath);
//                 setTemplatePreview('Template uploaded and ready to use.');

//                 checkStep1Complete();
//             } else {
//                 throw new Error(result.message || 'Failed to upload template');
//             }
//         } catch (error) {
//             alert('Error uploading template file: ' + error.message);
//             setTemplateProgress(0);
//         }
//     };

//     // Save template content
//     const saveTemplate = () => {
//         if (templateContent.trim()) {
//             setTemplatePreview('Template content saved and ready to use.');
//             checkStep1Complete();
//         } else {
//             alert('Please enter HTML template content');
//         }
//     };

//     // Check if step 1 is complete
//     const checkStep1Complete = () => {
//         if (excelPreview && (templatePreview || templateContent)) {
//             setNextToStep2Disabled(false);
//         }
//     };

//     // Test SMTP connection with backend
//     const testConnection = async () => {
//         if (!smtpServer || !emailUser || !emailPass) {
//             alert('Please fill in all SMTP fields');
//             return;
//         }

//         setTestingConnection(true);
//         setConnectionStatus('');

//         try {
//             const response = await fetch(`${API_BASE}/test-connection`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     smtpServer,
//                     smtpPort,
//                     emailUser,
//                     emailPass
//                 })
//             });

//             const result = await response.json();

//             if (result.success) {
//                 setConnectionStatus('success');
//             } else {
//                 setConnectionStatus('failed');
//                 alert('Connection failed: ' + result.message);
//             }
//         } catch (error) {
//             setConnectionStatus('failed');
//             alert('Connection test failed: ' + error.message);
//         } finally {
//             setTestingConnection(false);
//             validateStep2();
//         }
//     };

//     // Validate step 2
//     const validateStep2 = () => {
//         const isValid = selectedEmailColumn && subjectLine &&
//             smtpServer && smtpPort &&
//             emailUser && emailPass &&
//             connectionStatus === 'success';

//         setNextToStep3Disabled(!isValid);
//     };

//     // Add variable mapping
//     const addVariableMapping = () => {
//         setVariableMappings([
//             ...variableMappings,
//             { placeholder: '', column: '' }
//         ]);
//     };

//     // Update variable mapping
//     const updateVariableMapping = (index, field, value) => {
//         const newMappings = [...variableMappings];
//         newMappings[index][field] = value;
//         setVariableMappings(newMappings);
//         updateEmailPreview(newMappings);
//     };

//     // Remove variable mapping
//     const removeVariableMapping = (index) => {
//         const newMappings = [...variableMappings];
//         newMappings.splice(index, 1);
//         setVariableMappings(newMappings);
//         updateEmailPreview(newMappings);
//     };

//     // Update email preview
//     const updateEmailPreview = (mappings = variableMappings) => {
//         if (!templateContent || !excelData || !excelData.sample || excelData.sample.length === 0) {
//             setEmailPreviewContent('Preview will appear here once template and data are ready');
//             return;
//         }

//         // Use first sample record
//         const sampleData = excelData.sample[0];
//         let preview = templateContent;

//         // Replace variables
//         mappings.forEach(mapping => {
//             if (mapping.placeholder && mapping.column && sampleData[mapping.column]) {
//                 const regex = new RegExp(`{{${mapping.placeholder}}}`, 'g');
//                 preview = preview.replace(regex, sampleData[mapping.column]);
//             }
//         });

//         // Replace common placeholders
//         if (selectedNameColumn && sampleData[selectedNameColumn]) {
//             preview = preview.replace(/{{name}}/g, sampleData[selectedNameColumn]);
//         }

//         setEmailPreviewContent(preview);
//     };

//     // Start sending emails via backend
//     // const startSending = async () => {
//     //     try {
//     //         const response = await fetch(`${API_BASE}/campaign`, {
//     //             method: 'POST',
//     //             headers: {
//     //                 'Content-Type': 'application/json'
//     //             },
//     //             body: JSON.stringify({
//     //                 excelPath: excelFilePath,
//     //                 htmlPath: templateFilePath,
//     //                 emailColumn: selectedEmailColumn,
//     //                 nameColumn: selectedNameColumn,
//     //                 subjectLine,
//     //                 smtpServer,
//     //                 smtpPort,
//     //                 emailUser,
//     //                 emailPass,
//     //                 senderName,
//     //                 variables: variableMappings,
//     //                 delayBetweenEmails,
//     //                 template: templateContent // Include template content for paste method
//     //             })
//     //         });

//     //         const result = await response.json();

//     //         if (result.success) {
//     //             setCurrentJobId(result.jobId);
//     //             setIsSending(true);
//     //             setSendingComplete(false);
//     //             setSentCount(0);
//     //             setFailedCount(0);
//     //             setRemainingCount(result.total);
//     //             setSendingProgress(0);
//     //             setSendingLogs([]);

//     //             // Start polling for status
//     //             const interval = setInterval(() => {
//     //                 checkSendingStatus(result.jobId);
//     //             }, 2000);

//     //             setStatusInterval(interval);
//     //         } else {
//     //             throw new Error(result.message || 'Failed to start sending');
//     //         }
//     //     } catch (error) {
//     //         alert('Error starting email send: ' + error.message);
//     //     }
//     // };

//     console.log(templateContent)
//     const startSending = async () => {
//     try {
//         // Create FormData object
//         const formData = new FormData();

//         // Append the Excel file
//         formData.append('excel', excelFile);

//         // If using template file, append it; otherwise, send template content as text
//         if (templateFile) {
//             formData.append('template', templateFile);
//         }

//         // Append all other data as form fields
//         formData.append('templateContent', templateContent); // Send template content separately
//         formData.append('emailColumn', selectedEmailColumn);
//         formData.append('nameColumn', selectedNameColumn);
//         formData.append('subjectLine', subjectLine);
//         formData.append('smtpServer', smtpServer);
//         formData.append('smtpPort', smtpPort);
//         formData.append('emailUser', emailUser);
//         formData.append('emailPass', emailPass);
//         formData.append('senderName', senderName);
//         formData.append('campaign_name', campaignName);
//         formData.append('delayBetweenEmails', delayBetweenEmails);

//         // Handle variableMappings object - convert to JSON string
//         formData.append('variables', JSON.stringify(variableMappings));

//         const response = await fetch(`${API_BASE}/campaign`, {
//             method: 'POST',
//             body: formData
//         });

//         const result = await response.json();

//         if (result.success) {
//             setCurrentJobId(result.jobId);
//             setIsSending(true);
//             setSendingComplete(false);
//             setSentCount(0);
//             setFailedCount(0);
//             setRemainingCount(result.total);
//             setSendingProgress(0);
//             setSendingLogs([]);

//             // Start polling for status
//             const interval = setInterval(() => {
//                 checkSendingStatus(result.jobId);
//             }, 2000);

//             setStatusInterval(interval);
//         } else {
//             throw new Error(result.message || 'Failed to start sending');
//         }
//     } catch (error) {
//         alert('Error starting email send: ' + error.message);
//     }
// };



//     // Check sending status
//     const checkSendingStatus = async (jobId) => {
//         try {
//             const response = await fetch(`${API_BASE}/send-status/${jobId}`);
//             const result = await response.json();

//             if (result.success) {
//                 setSentCount(result.sent);
//                 setFailedCount(result.failed);
//                 setRemainingCount(result.total - (result.sent + result.failed));

//                 const progress = ((result.sent + result.failed) / result.total) * 100;
//                 setSendingProgress(progress);

//                 // Add logs
//                 if (result.sent > sentCount) {
//                     setSendingLogs(prev => [
//                         {
//                             id: Date.now(),
//                             time: new Date().toLocaleTimeString(),
//                             message: `Successfully sent ${result.sent - sentCount} more emails`,
//                             type: 'success'
//                         },
//                         ...prev.slice(0, 49)
//                     ]);
//                 }

//                 if (result.failed > failedCount) {
//                     setSendingLogs(prev => [
//                         {
//                             id: Date.now() + 1,
//                             time: new Date().toLocaleTimeString(),
//                             message: `${result.failed - failedCount} emails failed to send`,
//                             type: 'error'
//                         },
//                         ...prev.slice(0, 49)
//                     ]);
//                 }

//                 if (result.completed || result.stopped) {
//                     setIsSending(false);
//                     setSendingComplete(true);

//                     if (statusInterval) {
//                         clearInterval(statusInterval);
//                         setStatusInterval(null);
//                     }

//                     setSendingLogs(prev => [
//                         {
//                             id: Date.now() + 2,
//                             time: new Date().toLocaleTimeString(),
//                             message: result.stopped ? 'Sending stopped by user' : 'Sending completed',
//                             type: 'info'
//                         },
//                         ...prev.slice(0, 49)
//                     ]);
//                 }
//             }
//         } catch (error) {
//             console.error('Error checking status:', error);
//         }
//     };

//     // Stop sending emails
//     const stopSending = async () => {
//         if (!currentJobId) return;

//         try {
//             const response = await fetch(`${API_BASE}/stop-sending`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     jobId: currentJobId
//                 })
//             });

//             const result = await response.json();

//             if (result.success) {
//                 setSendingLogs(prev => [
//                     {
//                         id: Date.now(),
//                         time: new Date().toLocaleTimeString(),
//                         message: 'Stop request sent. Sending will stop after current email.',
//                         type: 'info'
//                     },
//                     ...prev.slice(0, 49)
//                 ]);
//             }
//         } catch (error) {
//             console.error('Error stopping send:', error);
//         }
//     };

//     // Reset the whole process
//     const startOver = () => {
//         // Clear any active intervals
//         if (statusInterval) {
//             clearInterval(statusInterval);
//             setStatusInterval(null);
//         }

//         setActiveStep(1);
//         setExcelFile(null);
//         setExcelFileName('');
//         setTemplateFile(null);
//         setTemplateFileName('');
//         setTemplateContent('');
//         setExcelProgress(0);
//         setTemplateProgress(0);
//         setUploadExcelDisabled(true);
//         setUploadTemplateDisabled(true);
//         setNextToStep2Disabled(true);
//         setNextToStep3Disabled(true);
//         setExcelPreview(null);
//         setTemplatePreview(null);
//         setVariableMappings([]);
//         setSendingComplete(false);
//         setSendingLogs([]);
//         setConnectionStatus('');
//         setEmailColumns([]);
//         setSelectedEmailColumn('');
//         setSelectedNameColumn('');
//         setSubjectLine('');
//         setSmtpServer('');
//         setEmailUser('');
//         setEmailPass('');
//         setSenderName('');
//         setExcelData(null);
//         setTotalRows(0);
//         setRecipientCount(0);
//         setCurrentJobId(null);
//         setIsSending(false);
//         setSentCount(0);
//         setFailedCount(0);
//         setRemainingCount(0);
//         setSendingProgress(0);

//         // Reset file inputs
//         if (excelFileRef.current) excelFileRef.current.value = '';
//         if (templateFileRef.current) templateFileRef.current.value = '';
//     };

//     // Navigation functions
//     const goToStep = (step) => {
//         setActiveStep(step);
//     };

//     // Watch for changes to validate steps
//     useEffect(() => {
//         validateStep2();
//     }, [selectedEmailColumn, subjectLine, smtpServer, smtpPort, emailUser, emailPass, connectionStatus]);

//     // Initialize with a variable mapping and update preview
//     useEffect(() => {
//         if (variableMappings.length === 0) {
//             addVariableMapping();
//         }
//     }, []);

//     useEffect(() => {
//         updateEmailPreview();
//     }, [templateContent, excelData, variableMappings, selectedNameColumn]);

//     // Cleanup on unmount
//     useEffect(() => {
//         return () => {
//             if (statusInterval) {
//                 clearInterval(statusInterval);
//             }
//         };
//     }, [statusInterval]);

//     return (
//         <div className="bg-gray-100 min-h-screen">


//             <div className="max-w-6xl mx-auto p-5">
//                 <header className="text-center mb-8 py-5">
//                     <h1 className="text-4xl text-blue-600 mb-2">Email Marketing Tool</h1>
//                     <p className="text-xl text-gray-600">Send personalized emails to your contact list</p>
//                 </header>

//                 <div className="mb-8 relative">
//                     <ul className="flex justify-between">
//                         <li
//                             className={`relative pt-10 px-4 text-center font-semibold flex-1 z-10 cursor-pointer ${activeStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}
//                             onClick={() => activeStep > 1 && goToStep(1)}
//                         >
//                             <span className={`absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white ${activeStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}>
//                                 <Upload size={16} />
//                             </span>
//                             1. Upload Files
//                         </li>
//                         <li
//                             className={`relative pt-10 px-4 text-center font-semibold flex-1 z-10 cursor-pointer ${activeStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}
//                             onClick={() => activeStep > 2 && goToStep(2)}
//                         >
//                             <span className={`absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white ${activeStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}>
//                                 <Settings size={16} />
//                             </span>
//                             2. Configure
//                         </li>
//                         <li
//                             className={`relative pt-10 px-4 text-center font-semibold flex-1 z-10 cursor-pointer ${activeStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}
//                             onClick={() => activeStep > 3 && goToStep(3)}
//                         >
//                             <span className={`absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white ${activeStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}>
//                                 <FileText size={16} />
//                             </span>
//                             3. Personalize
//                         </li>
//                         <li
//                             className={`relative pt-10 px-4 text-center font-semibold flex-1 z-10 ${activeStep >= 4 ? 'text-blue-600' : 'text-gray-500'}`}
//                         >
//                             <span className={`absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white ${activeStep >= 4 ? 'bg-blue-600' : 'bg-gray-300'}`}>
//                                 <Send size={16} />
//                             </span>
//                             4. Send
//                         </li>
//                     </ul>
//                     <div className="absolute top-8 left-0 w-full h-1 bg-gray-300 z-0"></div>
//                 </div>

//                 {/* Step 1: Upload Files */}
//                 <div className={`${activeStep === 1 ? 'block' : 'hidden'}`}>
//                     <div className="bg-white rounded-lg shadow-md p-8 mb-8">
//                         <h2 className="text-2xl text-blue-600 mb-5">Upload Your Data</h2>

//                         <div className="mb-8 pb-5 border-b border-gray-200">
//                             <h3 className="text-xl text-gray-800 mb-3">Excel File with Contacts</h3>
//                             <div className="relative mb-4">
//                                 <input
//                                     ref={excelFileRef}
//                                     type="file"
//                                     id="excel-file"
//                                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
//                                     accept=".xlsx, .xls"
//                                     onChange={handleExcelFileChange}
//                                 />
//                                 <label
//                                     htmlFor="excel-file"
//                                     className="flex items-center p-3 bg-gray-100 border border-dashed border-gray-300 rounded-md cursor-pointer transition-all hover:bg-gray-200"
//                                 >
//                                     <span className="text-2xl mr-3">📊</span>
//                                     <span>Choose Excel File</span>
//                                 </label>
//                                 {excelFileName && <span className="block mt-2 text-sm text-blue-600">{excelFileName}</span>}
//                             </div>
//                             <p className="text-sm text-gray-500 mb-3">Upload an Excel file containing your contact list</p>

//                             <div className="h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
//                                 <div
//                                     className="h-full bg-blue-600 transition-all duration-300"
//                                     style={{ width: `${excelProgress}%` }}
//                                 ></div>
//                             </div>

//                             <button
//                                 className={`px-5 py-2 rounded-md ${uploadExcelDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
//                                 disabled={uploadExcelDisabled}
//                                 onClick={uploadExcel}
//                             >
//                                 Upload Excel
//                             </button>

//                             {excelPreview && (
//                                 <div className="mt-5 border border-gray-200 rounded-md p-3 max-h-64 overflow-y-auto">
//                                     <div className="mb-2 text-sm text-gray-600">
//                                         Preview - Total Records: {recipientCount}
//                                     </div>
//                                     <table className="w-full">
//                                         <thead>
//                                             <tr>
//                                                 {excelPreview.headers.map((header, index) => (
//                                                     <th key={index} className="p-2 bg-gray-100 text-left text-sm font-medium">{header}</th>
//                                                 ))}
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {excelPreview.data.map((row, rowIndex) => (
//                                                 <tr key={rowIndex}>
//                                                     {row.map((cell, cellIndex) => (
//                                                         <td key={cellIndex} className="p-2 border-b border-gray-100 text-sm">{cell}</td>
//                                                     ))}
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             )}
//                         </div>



//                         <div className="mb-8">
//                             <h3 className="text-xl text-gray-800 mb-3">Email Template</h3>
//                             <div className="flex mb-4">
//                                 <button
//                                     className={`flex-1 py-2 border ${activeTemplateTab === 'upload' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 border-gray-300'} rounded-l-md`}
//                                     onClick={() => handleTemplateTabClick('upload')}
//                                 >
//                                     Upload HTML
//                                 </button>
//                                 <button
//                                     className={`flex-1 py-2 border ${activeTemplateTab === 'paste' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 border-gray-300'} rounded-r-md`}
//                                     onClick={() => handleTemplateTabClick('paste')}
//                                 >
//                                     Paste HTML
//                                 </button>
//                             </div>

//                             {activeTemplateTab === 'upload' ? (
//                                 <div>
//                                     <div className="relative mb-4">
//                                         <input
//                                             ref={templateFileRef}
//                                             type="file"
//                                             id="template-file"
//                                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
//                                             accept=".html, .htm"
//                                             onChange={handleTemplateFileChange}
//                                         />
//                                         <label
//                                             htmlFor="template-file"
//                                             className="flex items-center p-3 bg-gray-100 border border-dashed border-gray-300 rounded-md cursor-pointer transition-all hover:bg-gray-200"
//                                         >
//                                             <span className="text-2xl mr-3">📝</span>
//                                             <span>Choose HTML Template</span>
//                                         </label>
//                                         {templateFileName && <span className="block mt-2 text-sm text-blue-600">{templateFileName}</span>}
//                                     </div>

//                                     <div className="h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
//                                         <div
//                                             className="h-full bg-blue-600 transition-all duration-300"
//                                             style={{ width: `${templateProgress}%` }}
//                                         ></div>
//                                     </div>

//                                     <button
//                                         className={`px-5 py-2 rounded-md ${uploadTemplateDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
//                                         disabled={uploadTemplateDisabled}
//                                         onClick={uploadTemplate}
//                                     >
//                                         Upload Template
//                                     </button>
//                                 </div>
//                             ) : (
//                                 <div>
//                                     <textarea
//                                         id="template-content"
//                                         className="w-full h-36 p-3 border border-gray-300 rounded-md mb-3 resize-y"
//                                         placeholder="Paste your HTML template here..."
//                                         value={templateContent}
//                                         onChange={(e) => setTemplateContent(e.target.value)}
//                                     ></textarea>

//                                     <button
//                                         className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
//                                         onClick={saveTemplate}
//                                     >
//                                         Save Template
//                                     </button>
//                                 </div>
//                             )}

//                             <p className="text-sm text-gray-500 mt-3">Use placeholder tags like {"{{name}}"} in your template</p>

//                             {templatePreview && (
//                                 <div className="mt-5 p-4 border border-gray-200 rounded-md min-h-24 bg-green-50 text-green-700">
//                                     {templatePreview}
//                                 </div>
//                             )}
//                         </div>

//                         <div className="flex justify-end">
//                             <button
//                                 className={`px-5 py-2 rounded-md ${nextToStep2Disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
//                                 // disabled={nextToStep2Disabled}
//                                 onClick={() => goToStep(2)}
//                             >
//                                 Next: Configure
//                             </button>
//                         </div>
//                     </div>



//                 </div>

//                 {/* step 2 */}

//                 <div className={`${activeStep === 2 ? 'block' : 'hidden'}`}>
//                     <div className="bg-white rounded-lg shadow-md p-8 mb-8">
//                         <h2 className="text-2xl text-blue-600 mb-5">Configure Email Settings</h2>
//                         <div className="mb-8">
//                             <h3 className="text-xl text-gray-800 mb-3">SMTP Settings</h3>

//                             <div className="mb-4">
//                                 <label htmlFor="smtp-server" className="block mb-1 font-medium">SMTP Server</label>
//                                 <input
//                                     type="text"
//                                     id="smtp-server"
//                                     className="w-full p-2 border border-gray-300 rounded-md"
//                                     placeholder="e.g., smtp.gmail.com"
//                                     value={smtpServer}
//                                     onChange={(e) => setSmtpServer(e.target.value)}
//                                 />
//                             </div>

//                             <div className="mb-4">
//                                 <label htmlFor="smtp-port" className="block mb-1 font-medium">SMTP Port</label>
//                                 <select
//                                     id="smtp-port"
//                                     className="w-full p-2 border border-gray-300 rounded-md"
//                                     value={smtpPort}
//                                     onChange={(e) => setSmtpPort(e.target.value)}
//                                 >
//                                     <option value="587">587 (TLS)</option>
//                                     <option value="465">465 (SSL)</option>
//                                     <option value="25">25 (Standard)</option>
//                                 </select>
//                             </div>

//                             <div className="mb-4">
//                                 <label htmlFor="email-user" className="block mb-1 font-medium">Email Address</label>
//                                 <input
//                                     type="email"
//                                     id="email-user"
//                                     className="w-full p-2 border border-gray-300 rounded-md"
//                                     placeholder="your@email.com"
//                                     value={emailUser}
//                                     onChange={(e) => setEmailUser(e.target.value)}
//                                 />
//                             </div>

//                             <div className="mb-4">
//                                 <label htmlFor="email-pass" className="block mb-1 font-medium">Password/App Password</label>
//                                 <input
//                                     type="password"
//                                     id="email-pass"
//                                     className="w-full p-2 border border-gray-300 rounded-md"
//                                     placeholder="Your password or app password"
//                                     value={emailPass}
//                                     onChange={(e) => setEmailPass(e.target.value)}
//                                 />
//                             </div>

//                             <div className="mb-4">
//                                 <label htmlFor="sender-name" className="block mb-1 font-medium">Sender Name</label>
//                                 <input
//                                     type="text"
//                                     id="sender-name"
//                                     className="w-full p-2 border border-gray-300 rounded-md"
//                                     placeholder="Your Name or Company"
//                                     value={senderName}
//                                     onChange={(e) => setSenderName(e.target.value)}
//                                 />
//                             </div>

//                             <button
//                                 className={`px-5 py-2 rounded-md ${testingConnection ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white flex items-center gap-2`}
//                                 onClick={testConnection}
//                                 disabled={testingConnection}
//                             >
//                                 {testingConnection ? (
//                                     <>
//                                         <Clock size={16} className="animate-spin" />
//                                         Testing...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Settings size={16} />
//                                         Test Connection
//                                     </>
//                                 )}
//                             </button>

//                             {connectionStatus && (
//                                 <div className={`mt-3 p-3 rounded-md flex items-center gap-2 ${connectionStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                                     {connectionStatus === 'success' ? (
//                                         <>
//                                             <CheckCircle size={16} />
//                                             Connection successful!
//                                         </>
//                                     ) : (
//                                         <>
//                                             <AlertCircle size={16} />
//                                             Connection failed. Please check your settings.
//                                         </>
//                                     )}
//                                 </div>
//                             )}
//                         </div>

//                         <div className="mb-8">
//                             <h3 className="text-xl text-gray-800 mb-3">Email Configuration</h3>

//                             <div className="mb-4">
//                                 <label htmlFor="email-column" className="block mb-1 font-medium">Email Column</label>
//                                 <select
//                                     id="email-column"
//                                     className="w-full p-2 border border-gray-300 rounded-md"
//                                     value={selectedEmailColumn}
//                                     onChange={(e) => setSelectedEmailColumn(e.target.value)}
//                                 >
//                                     <option value="">Select column containing emails</option>
//                                     {emailColumns.map((column, index) => (
//                                         <option key={index} value={column}>{column}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div className="mb-4">
//                                 <label htmlFor="name-column" className="block mb-1 font-medium">Name Column (optional)</label>
//                                 <select
//                                     id="name-column"
//                                     className="w-full p-2 border border-gray-300 rounded-md"
//                                     value={selectedNameColumn}
//                                     onChange={(e) => setSelectedNameColumn(e.target.value)}
//                                 >
//                                     <option value="">Select column containing names</option>
//                                     {emailColumns.map((column, index) => (
//                                         <option key={index} value={column}>{column}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div className="mb-4">
//                                 <label htmlFor="subject-line" className="block mb-1 font-medium">Email Subject Line</label>
//                                 <input
//                                     type="text"
//                                     id="subject-line"
//                                     className="w-full p-2 border border-gray-300 rounded-md"
//                                     placeholder="Subject of your email"
//                                     value={subjectLine}
//                                     onChange={(e) => setSubjectLine(e.target.value)}
//                                 />
//                                 <p className="text-sm text-gray-500 mt-1">You can use {"{{name}}"} to personalize the subject</p>
//                             </div>

//                             <div className="mb-4">
//                                 <label htmlFor="subject-line" className="block mb-1 font-medium">Campaign Name</label>
//                                 <input
//                                     type="text"
//                                     id="campaign-name"
//                                     className="w-full p-2 border border-gray-300 rounded-md"
//                                     placeholder="Campaign Name"
//                                     value={campaignName}
//                                     onChange={(e) => setCampaignName(e.target.value)}
//                                 />

//                             </div>
//                         </div>

//                         <div className="flex justify-between">
//                             <button
//                                 className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
//                                 onClick={() => goToStep(1)}
//                             >
//                                 Back
//                             </button>
//                             <button
//                                 className={`px-5 py-2 rounded-md ${nextToStep3Disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
//                                 // disabled={nextToStep3Disabled}
//                                 onClick={() => goToStep(3)}
//                             >
//                                 Next: Personalize
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Step 3: Personalize */}
//                 <div className={`${activeStep === 3 ? 'block' : 'hidden'}`}>
//                     <div className="bg-white rounded-lg shadow-md p-8 mb-8">
//                         <h2 className="text-2xl text-blue-600 mb-5">Personalize Your Email</h2>

//                         <div className="mb-8">
//                             <h3 className="text-xl text-gray-800 mb-3">Map Data Fields to Template Variables</h3>
//                             <p className="mb-4 text-gray-600">Connect your Excel data columns to template placeholder variables</p>

//                             <div className="mb-4">
//                                 {variableMappings.map((mapping, index) => (
//                                     <div key={index} className="flex items-center gap-3 mb-4">
//                                         <input
//                                             type="text"
//                                             className="flex-1 p-2 border border-gray-300 rounded-md"
//                                             placeholder="Template variable (e.g. name)"
//                                             value={mapping.placeholder}
//                                             onChange={(e) => updateVariableMapping(index, 'placeholder', e.target.value)}
//                                         />
//                                         <select
//                                             className="flex-1 p-2 border border-gray-300 rounded-md"
//                                             value={mapping.column}
//                                             onChange={(e) => updateVariableMapping(index, 'column', e.target.value)}
//                                         >
//                                             <option value="">Select Excel column</option>
//                                             {emailColumns.map((column, colIndex) => (
//                                                 <option key={colIndex} value={column}>{column}</option>
//                                             ))}
//                                         </select>
//                                         <button
//                                             className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600"
//                                             onClick={() => removeVariableMapping(index)}
//                                         >
//                                             <X size={16} />
//                                         </button>
//                                     </div>
//                                 ))}
//                             </div>

//                             <button
//                                 className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
//                                 onClick={addVariableMapping}
//                             >
//                                 Add Variable
//                             </button>
//                         </div>

//                         <div className="mb-8">
//                             <h3 className="text-xl text-gray-800 mb-3">Email Preview</h3>
//                             <div className="p-4 border border-gray-200 rounded-md min-h-64 overflow-y-auto bg-gray-50">
//                                 <div className="mb-2 text-sm text-gray-600 border-b pb-2">
//                                     <strong>Subject:</strong> {subjectLine || 'No subject set'}
//                                 </div>
//                                 <div
//                                     className="prose max-w-none"
//                                     dangerouslySetInnerHTML={{
//                                         __html: emailPreviewContent || 'Preview will appear here once the template is processed'
//                                     }}
//                                 />
//                             </div>
//                         </div>

//                         <div className="flex justify-between">
//                             <button
//                                 className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
//                                 onClick={() => goToStep(2)}
//                             >
//                                 Back
//                             </button>
//                             <button
//                                 className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
//                                 onClick={() => goToStep(4)}
//                             >
//                                 Next: Send
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Step 4: Send */}
//                 <div className={`${activeStep === 4 ? 'block' : 'hidden'}`}>
//                     <div className="bg-white rounded-lg shadow-md p-8 mb-8">
//                         <h2 className="text-2xl text-blue-600 mb-5">Review & Send</h2>

//                         {!isSending && !sendingComplete && (
//                             <div className="mb-8">
//                                 <h3 className="text-xl text-gray-800 mb-3">Sending Summary</h3>
//                                 <div className="bg-gray-100 p-4 rounded-md mb-5">
//                                     <div className="mb-2">
//                                         <span className="font-semibold mr-2">Total Recipients:</span> {recipientCount}
//                                     </div>
//                                     <div className="mb-2">
//                                         <span className="font-semibold mr-2">From:</span> {senderName} &lt;{emailUser}&gt;
//                                     </div>
//                                     <div className="mb-2">
//                                         <span className="font-semibold mr-2">Subject:</span> {subjectLine}
//                                     </div>
//                                     <div className="mb-2">
//                                         <span className="font-semibold mr-2">Email Column:</span> {selectedEmailColumn}
//                                     </div>
//                                     <div className="mb-2">
//                                         <span className="font-semibold mr-2">Name Column:</span> {selectedNameColumn || 'Not selected'}
//                                     </div>
//                                     <div>
//                                         <span className="font-semibold mr-2">SMTP Server:</span> {smtpServer}:{smtpPort}
//                                     </div>
//                                 </div>

//                                 <div className="mb-5">
//                                     <h4 className="font-semibold mb-2">Variable Mappings</h4>
//                                     <div className="bg-gray-50 p-3 rounded-md">
//                                         {variableMappings.length > 0 && variableMappings.some(m => m.placeholder && m.column) ? (
//                                             variableMappings.filter(m => m.placeholder && m.column).map((mapping, index) => (
//                                                 <div key={index} className="mb-1">
//                                                     <span className="text-blue-600">{"{{" + mapping.placeholder + "}}"}</span> → <span className="text-green-600">{mapping.column}</span>
//                                                 </div>
//                                             ))
//                                         ) : (
//                                             <span className="text-gray-500">No custom variables mapped</span>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="mb-5">
//                                     <h4 className="font-semibold mb-2">Sending Settings</h4>
//                                     <div className="mb-4">
//                                         <label htmlFor="delay-emails" className="block mb-1">Delay Between Emails (ms)</label>
//                                         <input
//                                             type="number"
//                                             id="delay-emails"
//                                             className="w-full p-2 border border-gray-300 rounded-md"
//                                             min="500"
//                                             value={delayBetweenEmails}
//                                             onChange={(e) => setDelayBetweenEmails(parseInt(e.target.value) || 2000)}
//                                         />
//                                         <p className="text-xs text-gray-500 mt-1">Recommended: 1000ms - 5000ms to avoid being flagged as spam</p>
//                                     </div>
//                                 </div>

//                                 <div className="flex justify-center">
//                                     <button
//                                         className="px-8 py-3 rounded-md bg-green-600 text-white text-lg hover:bg-green-700 flex items-center gap-2"
//                                         onClick={startSending}
//                                     >
//                                         <Mail size={20} />
//                                         Start Sending ({recipientCount} emails)
//                                     </button>
//                                 </div>
//                             </div>
//                         )}

//                         {(isSending || sendingComplete) && (
//                             <div className="mb-8">
//                                 <h3 className="text-xl text-gray-800 mb-3">Sending Progress</h3>

//                                 <div className="bg-gray-100 p-4 rounded-md mb-5">
//                                     <div className="flex justify-between items-center mb-2">
//                                         <span>Progress: {Math.round(sendingProgress)}%</span>
//                                         <span>{sentCount + failedCount} / {recipientCount}</span>
//                                     </div>
//                                     <div className="h-3 bg-gray-300 rounded-full mb-4">
//                                         <div
//                                             className="h-full bg-blue-600 rounded-full transition-all duration-300"
//                                             style={{ width: `${sendingProgress}%` }}
//                                         ></div>
//                                     </div>

//                                     <div className="grid grid-cols-3 gap-4 mb-3">
//                                         <div className="text-center">
//                                             <div className="text-3xl font-semibold text-green-600">{sentCount}</div>
//                                             <div className="text-sm text-gray-600">Sent</div>
//                                         </div>
//                                         <div className="text-center">
//                                             <div className="text-3xl font-semibold text-red-600">{failedCount}</div>
//                                             <div className="text-sm text-gray-600">Failed</div>
//                                         </div>
//                                         <div className="text-center">
//                                             <div className="text-3xl font-semibold text-blue-600">{remainingCount}</div>
//                                             <div className="text-sm text-gray-600">Remaining</div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="mb-5">
//                                     <h4 className="font-semibold mb-2">Sending Logs</h4>
//                                     <div className="border border-gray-200 rounded-md h-64 overflow-y-auto p-2 bg-gray-50">
//                                         {sendingLogs.map((log) => (
//                                             <div
//                                                 key={log.id}
//                                                 className={`px-3 py-2 mb-1 rounded-md text-sm ${log.type === 'success' ? 'bg-green-50 text-green-700 border-l-2 border-green-400' :
//                                                     log.type === 'error' ? 'bg-red-50 text-red-700 border-l-2 border-red-400' :
//                                                         'bg-blue-50 text-blue-700 border-l-2 border-blue-400'
//                                                     }`}
//                                             >
//                                                 <span className="text-gray-500 text-xs mr-2">{log.time}</span>
//                                                 {log.message}
//                                             </div>
//                                         ))}
//                                         {sendingLogs.length === 0 && (
//                                             <div className="text-center text-gray-500 p-4">Logs will appear here as emails are sent...</div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="flex justify-center gap-4">
//                                     {isSending ? (
//                                         <button
//                                             className="px-8 py-3 rounded-md bg-red-600 text-white text-lg hover:bg-red-700"
//                                             onClick={stopSending}
//                                         >
//                                             Stop Sending
//                                         </button>
//                                     ) : sendingComplete && (
//                                         <button
//                                             className="px-8 py-3 rounded-md bg-blue-600 text-white text-lg hover:bg-blue-700"
//                                             onClick={startOver}
//                                         >
//                                             Start Over
//                                         </button>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {!isSending && !sendingComplete && (
//                             <div className="flex justify-between">
//                                 <button
//                                     className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
//                                     onClick={() => goToStep(3)}
//                                 >
//                                     Back
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div >

//     );
// };



import { useState, useRef, useEffect } from 'react';
import { X, Upload, Mail, Settings, Send, FileText, CheckCircle, AlertCircle, Clock, Plus, Eye, Image as ImageIcon } from 'lucide-react';

export default function EmailMarketingTool() {
    const [activeStep, setActiveStep] = useState(1);
    const [excelFile, setExcelFile] = useState(null);
    const [excelFileName, setExcelFileName] = useState('');
    const [templateFile, setTemplateFile] = useState(null);
    const [templateFileName, setTemplateFileName] = useState('');
    const [templateContent, setTemplateContent] = useState('');
    const [activeTemplateTab, setActiveTemplateTab] = useState('upload');
    const [excelProgress, setExcelProgress] = useState(0);
    const [templateProgress, setTemplateProgress] = useState(0);
    const [uploadExcelDisabled, setUploadExcelDisabled] = useState(true);
    const [uploadTemplateDisabled, setUploadTemplateDisabled] = useState(true);
    const [nextToStep2Disabled, setNextToStep2Disabled] = useState(true);
    const [nextToStep3Disabled, setNextToStep3Disabled] = useState(true);
    const [excelPreview, setExcelPreview] = useState(null);
    const [templatePreview, setTemplatePreview] = useState(null);
    // const [recipientCount, setRecipientCount] = useState(0);

    // Excel data state
    const [excelData, setExcelData] = useState(null);
    const [totalRows, setTotalRows] = useState(0);
    const [excelFilePath, setExcelFilePath] = useState('');
    const [templateFilePath, setTemplateFilePath] = useState('');

    // SMTP Settings
    const [smtpServer, setSmtpServer] = useState('');
    const [smtpPort, setSmtpPort] = useState('587');
    const [emailUser, setEmailUser] = useState('');
    const [emailPass, setEmailPass] = useState('');
    const [senderName, setSenderName] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('');
    const [testingConnection, setTestingConnection] = useState(false);

    // Email Configuration
    const [emailColumns, setEmailColumns] = useState([]);
    const [selectedEmailColumn, setSelectedEmailColumn] = useState('');
    const [selectedNameColumn, setSelectedNameColumn] = useState('');
    const [subjectLine, setSubjectLine] = useState('');

    // Variable mappings
    const [variableMappings, setVariableMappings] = useState([]);
    const [emailPreviewContent, setEmailPreviewContent] = useState('');

    // Sending data
    const [recipientCount, setRecipientCount] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [sendingComplete, setSendingComplete] = useState(false);
    const [sentCount, setSentCount] = useState(0);
    const [failedCount, setFailedCount] = useState(0);
    const [remainingCount, setRemainingCount] = useState(0);
    const [sendingProgress, setSendingProgress] = useState(0);
    const [sendingLogs, setSendingLogs] = useState([]);
    const [delayBetweenEmails, setDelayBetweenEmails] = useState(2000);
    const [currentJobId, setCurrentJobId] = useState(null);
    const [statusInterval, setStatusInterval] = useState(null);
    const [campaignName, setCampaignName] = useState('');

    // New image-related state
    const [uploadedImages, setUploadedImages] = useState([]);
    const [imageProgress, setImageProgress] = useState({});
    const [showImageManager, setShowImageManager] = useState(false);
    const [draggedImage, setDraggedImage] = useState(null);

    // File input refs
    const excelFileRef = useRef(null);
    const templateFileRef = useRef(null);
    const imageFileRef = useRef(null);

    // Backend API base URL (adjust as needed)
    const API_BASE = 'http://localhost:5000';

    // Handle Excel file selection
    const handleExcelFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            alert('Please select a valid Excel file (.xlsx or .xls)');
            e.target.value = '';
            setExcelFileName('');
            return;
        }

        setExcelFile(file);
        setExcelFileName(file.name);
        setUploadExcelDisabled(false);
    };

    // Handle template file selection
    const handleTemplateFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
            alert('Please select a valid HTML file (.html or .htm)');
            e.target.value = '';
            setTemplateFileName('');
            return;
        }

        setTemplateFile(file);
        setTemplateFileName(file.name);
        setUploadTemplateDisabled(false);
    };

    // Handle image file selection
    const handleImageFileChange = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not a valid image file`);
                return;
            }

            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} is too large. Please choose an image under 5MB.`);
                return;
            }

            uploadImage(file);
        });

        // Reset file input
        e.target.value = '';
    };

    // const uploadImage = async (file) => {
    //     const imageId = Date.now() + Math.random();

    //     // Add image to state with loading status
    //     const newImage = {
    //         id: imageId,
    //         name: file.name,
    //         file: file,
    //         url: null,
    //         uploading: true,
    //         progress: 0
    //     };

    //     setUploadedImages(prev => [...prev, newImage]);

    //     const formData = new FormData();
    //     formData.append('image', file);

    //     try {
    //         // Simulate progress
    //         let progress = 0;
    //         const interval = setInterval(() => {
    //             progress += 20;
    //             setImageProgress(prev => ({
    //                 ...prev,
    //                 [imageId]: progress
    //             }));
    //             if (progress >= 80) {
    //                 clearInterval(interval);
    //             }
    //         }, 200);

    //         const response = await fetch(`http://localhost:5000/upload-image`, {
    //             method: 'POST',
    //             body: formData
    //         });

    //         const result = await response.json();

    //         if (result.success) {
    //             // Complete progress
    //             setImageProgress(prev => ({
    //                 ...prev,
    //                 [imageId]: 100
    //             }));

    //             // Update image with URL
    //             setUploadedImages(prev => 
    //                 prev.map(img => 
    //                     img.id === imageId 
    //                         ? { ...img, url: result.imageUrl, uploading: false }
    //                         : img
    //                 )
    //             );
    //         } else {
    //             throw new Error(result.message || 'Failed to upload image');
    //         }
    //     } catch (error) {
    //         alert('Error uploading image: ' + error.message);
    //         // Remove failed image
    //         setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    //         setImageProgress(prev => {
    //             const newProgress = { ...prev };
    //             delete newProgress[imageId];
    //             return newProgress;
    //         });
    //     }
    // };

    const removeImage = (imageId) => {
        setUploadedImages(prev => prev.filter(img => img.id !== imageId));
        setImageProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[imageId];
            return newProgress;
        });
    };

    const uploadImage = async (file) => {
        const imageId = Date.now() + Math.random();

        // Convert file to base64
        const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });

        // Add image to state with loading status
        const newImage = {
            id: imageId,
            name: file.name,
            file: file,
            url: null,
            base64: base64, // Store base64 data
            uploading: true,
            progress: 0,
            cidName: null
        };

        setUploadedImages(prev => [...prev, newImage]);

        const formData = new FormData();
        formData.append('image', file);

        try {
            // Simulate progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 20;
                setImageProgress(prev => ({
                    ...prev,
                    [imageId]: progress
                }));
                if (progress >= 80) {
                    clearInterval(interval);
                }
            }, 200);

            const response = await fetch(`http://localhost:5000/upload-image`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Complete progress
                setImageProgress(prev => ({
                    ...prev,
                    [imageId]: 100
                }));

                // Update image with URL (keep base64 for email use)
                // setUploadedImages(prev =>
                //     prev.map(img =>
                //         img.id === imageId
                //             ? { ...img, url: result.imageUrl, uploading: false }
                //             : img
                //     )
                // );
                // Update image with URL and CID info
                setUploadedImages(prev =>
                    prev.map(img =>
                        img.id === imageId
                            ? {
                                ...img,
                                url: result.imageUrl,
                                uploading: false,
                                filename: result.filename,
                                cidName: result.cidName || result.filename.split('.')[0]
                            }
                            : img
                    )
                );
            } else {
                throw new Error(result.message || 'Failed to upload image');
            }
        } catch (error) {
            alert('Error uploading image: ' + error.message);
            // Remove failed image
            setUploadedImages(prev => prev.filter(img => img.id !== imageId));
            setImageProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[imageId];
                return newProgress;
            });
        }
    };

    // Update insertImageIntoTemplate to use base64 for emails
    const insertImageIntoTemplate = (imageUrl, imageName, base64Data, cidName) => {
        console.log("Inserting image with CID:", cidName);

        // Use CID reference for email compatibility
        // The actual filename will be used as CID by the backend
        const imageTag = `<img src="cid:${cidName}" alt="${imageName}" style="max-width: 100%; height: auto;" />`;

        if (activeTemplateTab === 'paste') {
            const textarea = document.getElementById('template-content');
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = templateContent;
            const before = text.substring(0, start);
            const after = text.substring(end, text.length);

            setTemplateContent(before + imageTag + after);

            // Set cursor position after inserted image
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + imageTag.length;
                textarea.focus();
            }, 0);
        }
    };
    // const insertImageIntoTemplate = (imageUrl, imageName, base64Data) => {
    //     console.log("inserted");

    //     // Use base64 data for email compatibility
    //     // const imageTag = `<img src="${base64Data}" alt="${imageName}" style="max-width: 100%; height: auto;" />`;
    //     imageTag = `<img src="cid:${imageName}" alt="${imageName}" style="max-width: 100%; height: auto;" />`;

    //     if (activeTemplateTab === 'paste') {
    //         const textarea = document.getElementById('template-content');
    //         const start = textarea.selectionStart;
    //         const end = textarea.selectionEnd;
    //         const text = templateContent;
    //         const before = text.substring(0, start);
    //         const after = text.substring(end, text.length);

    //         setTemplateContent(before + imageTag + after);

    //         // Set cursor position after inserted image
    //         setTimeout(() => {
    //             textarea.selectionStart = textarea.selectionEnd = start + imageTag.length;
    //             textarea.focus();
    //         }, 0);
    //     }
    // };


    //  const insertImageIntoTemplate = (imageUrl, imageName) => {
    //     console.log("inserted")
    //     const imageTag = `<img src="${imageUrl}" alt="${imageName}" style="max-width: 100%; height: auto;" />`;

    //     if (activeTemplateTab === 'paste') {
    //         const textarea = document.getElementById('template-content');
    //         const start = textarea.selectionStart;
    //         const end = textarea.selectionEnd;
    //         const text = templateContent;
    //         const before = text.substring(0, start);
    //         const after = text.substring(end, text.length);

    //         setTemplateContent(before + imageTag + after);

    //         // Set cursor position after inserted image
    //         setTimeout(() => {
    //             textarea.selectionStart = textarea.selectionEnd = start + imageTag.length;
    //             textarea.focus();
    //         }, 0);
    //     }
    // };

    //     const insertImageIntoTemplate = (imageUrl, imageName) => {
    //     console.log("inserted");

    //     // Make sure URL is absolute for email compatibility
    //     const absoluteUrl = imageUrl.startsWith('http') 
    //         ? imageUrl 
    //         : `${window.location.origin}${imageUrl}`;

    //     const imageTag = `<img src="${absoluteUrl}" alt="${imageName}" style="max-width: 100%; height: auto;" />`;

    //     if (activeTemplateTab === 'paste') {
    //         const textarea = document.getElementById('template-content');
    //         const start = textarea.selectionStart;
    //         const end = textarea.selectionEnd;
    //         const text = templateContent;
    //         const before = text.substring(0, start);
    //         const after = text.substring(end, text.length);

    //         setTemplateContent(before + imageTag + after);

    //         // Set cursor position after inserted image
    //         setTimeout(() => {
    //             textarea.selectionStart = textarea.selectionEnd = start + imageTag.length;
    //             textarea.focus();
    //         }, 0);
    //     }
    // };


    // Handle tab switching
    const handleTemplateTabClick = (tab) => {
        setActiveTemplateTab(tab);
    };

    // Upload Excel file to backend
    const uploadExcel = async () => {
        if (!excelFile) return;

        const formData = new FormData();
        formData.append('excel', excelFile);

        try {
            // Animate progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 20;
                setExcelProgress(progress);
                if (progress >= 80) {
                    clearInterval(interval);
                }
            }, 100);

            const response = await fetch(`${API_BASE}/preview-excel`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Complete progress
                setExcelProgress(100);

                // Store data
                setExcelData(result);
                setTotalRows(result.totalRows);
                setRecipientCount(result.totalRows);
                setExcelFilePath(result.filePath);

                // Set preview
                setExcelPreview({
                    headers: result.headers,
                    data: result.sample.map(obj => result.headers.map(header => obj[header] || ''))
                });

                // Set available columns
                setEmailColumns(result.headers);

                // Auto-detect email column
                const emailCol = result.headers.find(header =>
                    header.toLowerCase().includes('email') || header.toLowerCase().includes('mail')
                );
                if (emailCol) {
                    setSelectedEmailColumn(emailCol);
                }

                // Auto-detect name column
                const nameCol = result.headers.find(header =>
                    header.toLowerCase().includes('name') || header.toLowerCase().includes('first')
                );
                if (nameCol) {
                    setSelectedNameColumn(nameCol);
                }

                checkStep1Complete();
            } else {
                throw new Error(result.message || 'Failed to process Excel file');
            }
        } catch (error) {
            alert('Error uploading Excel file: ' + error.message);
            setExcelProgress(0);
        }
    };

    // Upload template file to backend
    const uploadTemplate = async () => {
        if (!templateFile) return;

        const formData = new FormData();
        formData.append('template', templateFile);

        try {
            // Animate progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 20;
                setTemplateProgress(progress);
                if (progress >= 80) {
                    clearInterval(interval);
                }
            }, 100);

            const response = await fetch(`${API_BASE}/upload-template`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Complete progress
                setTemplateProgress(100);

                setTemplateContent(result.template);
                setTemplateFilePath(result.filePath);
                setTemplatePreview('Template uploaded and ready to use.');

                checkStep1Complete();
            } else {
                throw new Error(result.message || 'Failed to upload template');
            }
        } catch (error) {
            alert('Error uploading template file: ' + error.message);
            setTemplateProgress(0);
        }
    };

    // Save template content
    const saveTemplate = () => {
        if (templateContent.trim()) {
            setTemplatePreview('Template content saved and ready to use.');
            checkStep1Complete();
        } else {
            alert('Please enter HTML template content');
        }
    };

    // Check if step 1 is complete
    const checkStep1Complete = () => {
        if (excelPreview && (templatePreview || templateContent)) {
            setNextToStep2Disabled(false);
        }
    };

    // Test SMTP connection with backend
    const testConnection = async () => {
        if (!smtpServer || !emailUser || !emailPass) {
            alert('Please fill in all SMTP fields');
            return;
        }

        setTestingConnection(true);
        setConnectionStatus('');

        try {
            const response = await fetch(`${API_BASE}/test-connection`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    smtpServer,
                    smtpPort,
                    emailUser,
                    emailPass
                })
            });

            const result = await response.json();

            if (result.success) {
                setConnectionStatus('success');
            } else {
                setConnectionStatus('failed');
                alert('Connection failed: ' + result.message);
            }
        } catch (error) {
            setConnectionStatus('failed');
            alert('Connection test failed: ' + error.message);
        } finally {
            setTestingConnection(false);
            validateStep2();
        }
    };

    // Validate step 2
    const validateStep2 = () => {
        const isValid = selectedEmailColumn && subjectLine &&
            smtpServer && smtpPort &&
            emailUser && emailPass &&
            connectionStatus === 'success';

        setNextToStep3Disabled(!isValid);
    };

    // Add variable mapping
    const addVariableMapping = () => {
        setVariableMappings([
            ...variableMappings,
            { placeholder: '', column: '' }
        ]);
    };

    // Update variable mapping
    const updateVariableMapping = (index, field, value) => {
        const newMappings = [...variableMappings];
        newMappings[index][field] = value;
        setVariableMappings(newMappings);
        updateEmailPreview(newMappings);
    };

    // Remove variable mapping
    const removeVariableMapping = (index) => {
        const newMappings = [...variableMappings];
        newMappings.splice(index, 1);
        setVariableMappings(newMappings);
        updateEmailPreview(newMappings);
    };

    // Update email preview
    const updateEmailPreview = (mappings = variableMappings) => {
        if (!templateContent || !excelData || !excelData.sample || excelData.sample.length === 0) {
            setEmailPreviewContent('Preview will appear here once template and data are ready');
            return;
        }

        // Use first sample record
        const sampleData = excelData.sample[0];
        let preview = templateContent;

        // Replace variables
        mappings.forEach(mapping => {
            if (mapping.placeholder && mapping.column && sampleData[mapping.column]) {
                const regex = new RegExp(`{{${mapping.placeholder}}}`, 'g');
                preview = preview.replace(regex, sampleData[mapping.column]);
            }
        });

        // Replace common placeholders
        if (selectedNameColumn && sampleData[selectedNameColumn]) {
            preview = preview.replace(/{{name}}/g, sampleData[selectedNameColumn]);
        }

        setEmailPreviewContent(preview);
    };

    // Start sending emails via backend
    // const startSending = async () => {
    //     try {
    //         const response = await fetch(`${API_BASE}/campaign`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({
    //                 excelPath: excelFilePath,
    //                 htmlPath: templateFilePath,
    //                 emailColumn: selectedEmailColumn,
    //                 nameColumn: selectedNameColumn,
    //                 subjectLine,
    //                 smtpServer,
    //                 smtpPort,
    //                 emailUser,
    //                 emailPass,
    //                 senderName,
    //                 variables: variableMappings,
    //                 delayBetweenEmails,
    //                 template: templateContent // Include template content for paste method
    //             })
    //         });

    //         const result = await response.json();

    //         if (result.success) {
    //             setCurrentJobId(result.jobId);
    //             setIsSending(true);
    //             setSendingComplete(false);
    //             setSentCount(0);
    //             setFailedCount(0);
    //             setRemainingCount(result.total);
    //             setSendingProgress(0);
    //             setSendingLogs([]);

    //             // Start polling for status
    //             const interval = setInterval(() => {
    //                 checkSendingStatus(result.jobId);
    //             }, 2000);

    //             setStatusInterval(interval);
    //         } else {
    //             throw new Error(result.message || 'Failed to start sending');
    //         }
    //     } catch (error) {
    //         alert('Error starting email send: ' + error.message);
    //     }
    // };

    console.log(templateContent)
    const startSending = async () => {
        try {
            // Create FormData object
            const formData = new FormData();

            // Append the Excel file
            formData.append('excel', excelFile);

            // If using template file, append it; otherwise, send template content as text
            if (templateFile) {
                formData.append('template', templateFile);
            }

            // Append all other data as form fields
            formData.append('templateContent', templateContent); // Send template content separately
            formData.append('emailColumn', selectedEmailColumn);
            formData.append('nameColumn', selectedNameColumn);
            formData.append('subjectLine', subjectLine);
            formData.append('smtpServer', smtpServer);
            formData.append('smtpPort', smtpPort);
            formData.append('emailUser', emailUser);
            formData.append('emailPass', emailPass);
            formData.append('senderName', senderName);
            formData.append('campaign_name', campaignName);
            formData.append('delayBetweenEmails', delayBetweenEmails);

            // Handle variableMappings object - convert to JSON string
            formData.append('variables', JSON.stringify(variableMappings));

            const response = await fetch(`${API_BASE}/campaign`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                setCurrentJobId(result.jobId);
                setIsSending(true);
                setSendingComplete(false);
                setSentCount(0);
                setFailedCount(0);
                setRemainingCount(result.total);
                setSendingProgress(0);
                setSendingLogs([]);

                // Start polling for status
                const interval = setInterval(() => {
                    checkSendingStatus(result.jobId);
                }, 2000);

                setStatusInterval(interval);
            } else {
                throw new Error(result.message || 'Failed to start sending');
            }
        } catch (error) {
            alert('Error starting email send: ' + error.message);
        }
    };



    // Check sending status
    const checkSendingStatus = async (jobId) => {
        try {
            const response = await fetch(`${API_BASE}/send-status/${jobId}`);
            const result = await response.json();

            if (result.success) {
                setSentCount(result.sent);
                setFailedCount(result.failed);
                setRemainingCount(result.total - (result.sent + result.failed));

                const progress = ((result.sent + result.failed) / result.total) * 100;
                setSendingProgress(progress);

                // Add logs
                if (result.sent > sentCount) {
                    setSendingLogs(prev => [
                        {
                            id: Date.now(),
                            time: new Date().toLocaleTimeString(),
                            message: `Successfully sent ${result.sent - sentCount} more emails`,
                            type: 'success'
                        },
                        ...prev.slice(0, 49)
                    ]);
                }

                if (result.failed > failedCount) {
                    setSendingLogs(prev => [
                        {
                            id: Date.now() + 1,
                            time: new Date().toLocaleTimeString(),
                            message: `${result.failed - failedCount} emails failed to send`,
                            type: 'error'
                        },
                        ...prev.slice(0, 49)
                    ]);
                }

                if (result.completed || result.stopped) {
                    setIsSending(false);
                    setSendingComplete(true);

                    if (statusInterval) {
                        clearInterval(statusInterval);
                        setStatusInterval(null);
                    }

                    setSendingLogs(prev => [
                        {
                            id: Date.now() + 2,
                            time: new Date().toLocaleTimeString(),
                            message: result.stopped ? 'Sending stopped by user' : 'Sending completed',
                            type: 'info'
                        },
                        ...prev.slice(0, 49)
                    ]);
                }
            }
        } catch (error) {
            console.error('Error checking status:', error);
        }
    };

    // Stop sending emails
    const stopSending = async () => {
        if (!currentJobId) return;

        try {
            const response = await fetch(`${API_BASE}/stop-sending`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jobId: currentJobId
                })
            });

            const result = await response.json();

            if (result.success) {
                setSendingLogs(prev => [
                    {
                        id: Date.now(),
                        time: new Date().toLocaleTimeString(),
                        message: 'Stop request sent. Sending will stop after current email.',
                        type: 'info'
                    },
                    ...prev.slice(0, 49)
                ]);
            }
        } catch (error) {
            console.error('Error stopping send:', error);
        }
    };

    // Reset the whole process
    const startOver = () => {
        // Clear any active intervals
        if (statusInterval) {
            clearInterval(statusInterval);
            setStatusInterval(null);
        }

        setActiveStep(1);
        setExcelFile(null);
        setExcelFileName('');
        setTemplateFile(null);
        setTemplateFileName('');
        setTemplateContent('');
        setExcelProgress(0);
        setTemplateProgress(0);
        setUploadExcelDisabled(true);
        setUploadTemplateDisabled(true);
        setNextToStep2Disabled(true);
        setNextToStep3Disabled(true);
        setExcelPreview(null);
        setTemplatePreview(null);
        setVariableMappings([]);
        setSendingComplete(false);
        setSendingLogs([]);
        setConnectionStatus('');
        setEmailColumns([]);
        setSelectedEmailColumn('');
        setSelectedNameColumn('');
        setSubjectLine('');
        setSmtpServer('');
        setEmailUser('');
        setEmailPass('');
        setSenderName('');
        setExcelData(null);
        setTotalRows(0);
        setRecipientCount(0);
        setCurrentJobId(null);
        setIsSending(false);
        setSentCount(0);
        setFailedCount(0);
        setRemainingCount(0);
        setSendingProgress(0);

        // Reset file inputs
        if (excelFileRef.current) excelFileRef.current.value = '';
        if (templateFileRef.current) templateFileRef.current.value = '';
    };

    // Navigation functions
    const goToStep = (step) => {
        setActiveStep(step);
    };

    // Watch for changes to validate steps
    useEffect(() => {
        validateStep2();
    }, [selectedEmailColumn, subjectLine, smtpServer, smtpPort, emailUser, emailPass, connectionStatus]);

    // Initialize with a variable mapping and update preview
    useEffect(() => {
        if (variableMappings.length === 0) {
            addVariableMapping();
        }
    }, []);

    useEffect(() => {
        updateEmailPreview();
    }, [templateContent, excelData, variableMappings, selectedNameColumn]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (statusInterval) {
                clearInterval(statusInterval);
            }
        };
    }, [statusInterval]);

    return (
        // <div className="bg-gray-100 min-h-screen">


        //     <div className="max-w-6xl mx-auto p-5">
        //         <header className="text-center mb-8 py-5">
        //             <h1 className="text-4xl text-blue-600 mb-2">Email Marketing Tool</h1>
        //             <p className="text-xl text-gray-600">Send personalized emails to your contact list</p>
        //         </header>
        <div className="p-6 space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Compose Campaign</h2>
                <p className="text-gray-500 mt-1">Create a new email marketing campaign</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200/50">
          <h3 className="text-xl font-bold text-gray-900">Campaign Builder</h3>
          <p className="text-sm text-gray-500 mt-1">Design and configure your email campaign</p>
        </div>

            <div className="mb-8 relative">
                <ul className="flex justify-between">
                    <li
                        className={`relative pt-10 px-4 text-center font-semibold flex-1 z-10 cursor-pointer ${activeStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}
                        onClick={() => activeStep > 1 && goToStep(1)}
                    >
                        <span className={`absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white ${activeStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                            <Upload size={16} />
                        </span>
                        1. Upload Files
                    </li>
                    <li
                        className={`relative pt-10 px-4 text-center font-semibold flex-1 z-10 cursor-pointer ${activeStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}
                        onClick={() => activeStep > 2 && goToStep(2)}
                    >
                        <span className={`absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white ${activeStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                            <Settings size={16} />
                        </span>
                        2. Configure
                    </li>
                    <li
                        className={`relative pt-10 px-4 text-center font-semibold flex-1 z-10 cursor-pointer ${activeStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}
                        onClick={() => activeStep > 3 && goToStep(3)}
                    >
                        <span className={`absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white ${activeStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                            <FileText size={16} />
                        </span>
                        3. Personalize
                    </li>
                    <li
                        className={`relative pt-10 px-4 text-center font-semibold flex-1 z-10 ${activeStep >= 4 ? 'text-blue-600' : 'text-gray-500'}`}
                    >
                        <span className={`absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white ${activeStep >= 4 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                            <Send size={16} />
                        </span>
                        4. Send
                    </li>
                </ul>
                <div className="absolute top-8 left-0 w-full h-1 bg-gray-300 z-0"></div>
            </div>

            {/* Step 1: Upload Files */}
            {/* <div className={`${activeStep === 1 ? 'block' : 'hidden'}`}>
                    <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                        <h2 className="text-2xl text-blue-600 mb-5">Upload Your Data</h2>

                        <div className="mb-8 pb-5 border-b border-gray-200">
                            <h3 className="text-xl text-gray-800 mb-3">Excel File with Contacts</h3>
                            <div className="relative mb-4">
                                <input
                                    ref={excelFileRef}
                                    type="file"
                                    id="excel-file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    accept=".xlsx, .xls"
                                    onChange={handleExcelFileChange}
                                />
                                <label
                                    htmlFor="excel-file"
                                    className="flex items-center p-3 bg-gray-100 border border-dashed border-gray-300 rounded-md cursor-pointer transition-all hover:bg-gray-200"
                                >
                                    <span className="text-2xl mr-3">📊</span>
                                    <span>Choose Excel File</span>
                                </label>
                                {excelFileName && <span className="block mt-2 text-sm text-blue-600">{excelFileName}</span>}
                            </div>
                            <p className="text-sm text-gray-500 mb-3">Upload an Excel file containing your contact list</p>

                            <div className="h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-300"
                                    style={{ width: `${excelProgress}%` }}
                                ></div>
                            </div>

                            <button
                                className={`px-5 py-2 rounded-md ${uploadExcelDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                disabled={uploadExcelDisabled}
                                onClick={uploadExcel}
                            >
                                Upload Excel
                            </button>

                            {excelPreview && (
                                <div className="mt-5 border border-gray-200 rounded-md p-3 max-h-64 overflow-y-auto">
                                    <div className="mb-2 text-sm text-gray-600">
                                        Preview - Total Records: {recipientCount}
                                    </div>
                                    <table className="w-full">
                                        <thead>
                                            <tr>
                                                {excelPreview.headers.map((header, index) => (
                                                    <th key={index} className="p-2 bg-gray-100 text-left text-sm font-medium">{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {excelPreview.data.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={cellIndex} className="p-2 border-b border-gray-100 text-sm">{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>


                       
                        <div className="mb-8">
                            <h3 className="text-xl text-gray-800 mb-3">Email Template</h3>
                            <div className="flex mb-4">
                                <button
                                    className={`flex-1 py-2 border ${activeTemplateTab === 'upload' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 border-gray-300'} rounded-l-md`}
                                    onClick={() => handleTemplateTabClick('upload')}
                                >
                                    Upload HTML
                                </button>
                                <button
                                    className={`flex-1 py-2 border ${activeTemplateTab === 'paste' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 border-gray-300'} rounded-r-md`}
                                    onClick={() => handleTemplateTabClick('paste')}
                                >
                                    Paste HTML
                                </button>
                            </div>

                            {activeTemplateTab === 'upload' ? (
                                <div>
                                    <div className="relative mb-4">
                                        <input
                                            ref={templateFileRef}
                                            type="file"
                                            id="template-file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            accept=".html, .htm"
                                            onChange={handleTemplateFileChange}
                                        />
                                        <label
                                            htmlFor="template-file"
                                            className="flex items-center p-3 bg-gray-100 border border-dashed border-gray-300 rounded-md cursor-pointer transition-all hover:bg-gray-200"
                                        >
                                            <span className="text-2xl mr-3">📝</span>
                                            <span>Choose HTML Template</span>
                                        </label>
                                        {templateFileName && <span className="block mt-2 text-sm text-blue-600">{templateFileName}</span>}
                                    </div>

                                    <div className="h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all duration-300"
                                            style={{ width: `${templateProgress}%` }}
                                        ></div>
                                    </div>

                                    <button
                                        className={`px-5 py-2 rounded-md ${uploadTemplateDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                        disabled={uploadTemplateDisabled}
                                        onClick={uploadTemplate}
                                    >
                                        Upload Template
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <textarea
                                        id="template-content"
                                        className="w-full h-36 p-3 border border-gray-300 rounded-md mb-3 resize-y"
                                        placeholder="Paste your HTML template here..."
                                        value={templateContent}
                                        onChange={(e) => setTemplateContent(e.target.value)}
                                    ></textarea>

                                    <button
                                        className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                        onClick={saveTemplate}
                                    >
                                        Save Template
                                    </button>
                                </div>
                            )}

                            <p className="text-sm text-gray-500 mt-3">Use placeholder tags like {"{{name}}"} in your template</p>

                            {templatePreview && (
                                <div className="mt-5 p-4 border border-gray-200 rounded-md min-h-24 bg-green-50 text-green-700">
                                    {templatePreview}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                className={`px-5 py-2 rounded-md ${nextToStep2Disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                // disabled={nextToStep2Disabled}
                                onClick={() => goToStep(2)}
                            >
                                Next: Configure
                            </button>
                        </div>
                    </div>

                   
                    
                </div> */}

            <div className={`${activeStep === 1 ? 'block' : 'hidden'}`}>
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h2 className="text-2xl text-blue-600 mb-5">Upload Your Data</h2>

                    {/* Excel File Section */}
                    <div className="mb-8 pb-5 border-b border-gray-200">
                        <h3 className="text-xl text-gray-800 mb-3">Excel File with Contacts</h3>
                        <div className="relative mb-4">
                            <input
                                ref={excelFileRef}
                                type="file"
                                id="excel-file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                accept=".xlsx, .xls"
                                onChange={handleExcelFileChange}
                            />
                            <label
                                htmlFor="excel-file"
                                className="flex items-center p-3 bg-gray-100 border border-dashed border-gray-300 rounded-md cursor-pointer transition-all hover:bg-gray-200"
                            >
                                <span className="text-2xl mr-3">📊</span>
                                <span>Choose Excel File</span>
                            </label>
                            {excelFileName && <span className="block mt-2 text-sm text-blue-600">{excelFileName}</span>}
                        </div>
                        <p className="text-sm text-gray-500 mb-3">Upload an Excel file containing your contact list</p>

                        <div className="h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${excelProgress}%` }}
                            ></div>
                        </div>

                        <button
                            className={`px-5 py-2 rounded-md ${uploadExcelDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            disabled={uploadExcelDisabled}
                            onClick={uploadExcel}
                        >
                            Upload Excel
                        </button>

                        {excelPreview && (
                            <div className="mt-5 border border-gray-200 rounded-md p-3 max-h-64 overflow-y-auto">
                                <div className="mb-2 text-sm text-gray-600">
                                    Preview - Total Records: {recipientCount}
                                </div>
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            {excelPreview.headers.map((header, index) => (
                                                <th key={index} className="p-2 bg-gray-100 text-left text-sm font-medium">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {excelPreview.data.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {row.map((cell, cellIndex) => (
                                                    <td key={cellIndex} className="p-2 border-b border-gray-100 text-sm">{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Email Template Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl text-gray-800">Email Template</h3>
                            <button
                                onClick={() => setShowImageManager(!showImageManager)}
                                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Manage Images
                            </button>
                        </div>

                        {/* Image Manager */}
                        {showImageManager && (
                            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-medium text-gray-800">Image Manager</h4>
                                    <button
                                        onClick={() => imageFileRef.current?.click()}
                                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Images
                                    </button>
                                </div>

                                <input
                                    ref={imageFileRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageFileChange}
                                />

                                {/* {uploadedImages.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                          
                                            {uploadedImages.map((image) => (
                                                <div key={image.id} className="image-item">
                                                    <img src={image.url || image.base64} alt={image.name} />
                                                    <button
                                                        onClick={() => insertImageIntoTemplate(image.url, image.name, image.base64)}
                                                        disabled={image.uploading}
                                                    >
                                                        Insert into Template
                                                    </button>
                                                    <button onClick={() => removeImage(image.id)}>Remove</button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p>No images uploaded yet</p>
                                            <p className="text-sm">Click "Add Images" to get started</p>
                                        </div>
                                    )} */}
                                {uploadedImages.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {uploadedImages.map((image) => (
                                            <div key={image.id} className="relative group">
                                                <div className="aspect-square bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                    {image.uploading ? (
                                                        <div className="w-full h-full flex flex-col items-center justify-center">
                                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                            <div className="w-3/4 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${imageProgress[image.id] || 0}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-500 mt-2">Uploading...</span>
                                                        </div>
                                                    ) : (
                                                        <img
                                                            src={image.url || image.base64 || URL.createObjectURL(image.file)}
                                                            alt={image.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>

                                                {/* Remove button */}
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => removeImage(image.id)}
                                                        className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
                                                        title="Remove image"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>

                                                {/* Insert button - only show when not uploading */}
                                                {!image.uploading && (
                                                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => insertImageIntoTemplate(
                                                                image.url || image.base64,
                                                                image.name,
                                                                image.base64,
                                                                image.cidName || image.filename?.split('.')[0] || image.name.split('.')[0]
                                                            )}
                                                            className="w-full px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 shadow-lg"
                                                            title="Insert as CID reference"
                                                        >
                                                            Insert
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Image info */}
                                                <div className="mt-2">
                                                    <div className="text-xs text-gray-600 truncate" title={image.name}>
                                                        {image.name}
                                                    </div>

                                                    {/* Show CID info when available */}
                                                    {(image.cidName || image.filename) && !image.uploading && (
                                                        <div className="text-xs text-blue-600 truncate" title={`CID: ${image.cidName || image.filename?.split('.')[0]}`}>
                                                            CID: {image.cidName || image.filename?.split('.')[0]}
                                                        </div>
                                                    )}

                                                    {/* Upload status */}
                                                    {image.uploading && (
                                                        <div className="text-xs text-orange-500">
                                                            Uploading... {imageProgress[image.id] || 0}%
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>No images uploaded yet</p>
                                        <p className="text-sm">Click "Add Images" to get started</p>
                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
                                            <p className="font-medium">💡 Pro Tip:</p>
                                            <p>Images will be embedded using CID references for better Gmail compatibility</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Template Tabs */}
                        <div className="flex mb-4">
                            <button
                                className={`flex-1 py-2 border ${activeTemplateTab === 'upload' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 border-gray-300'} rounded-l-md`}
                                onClick={() => handleTemplateTabClick('upload')}
                            >
                                Upload HTML
                            </button>
                            <button
                                className={`flex-1 py-2 border ${activeTemplateTab === 'paste' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 border-gray-300'} rounded-r-md`}
                                onClick={() => handleTemplateTabClick('paste')}
                            >
                                Paste HTML
                            </button>
                        </div>

                        {activeTemplateTab === 'upload' ? (
                            <div>
                                <div className="relative mb-4">
                                    <input
                                        ref={templateFileRef}
                                        type="file"
                                        id="template-file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        accept=".html, .htm"
                                        onChange={handleTemplateFileChange}
                                    />
                                    <label
                                        htmlFor="template-file"
                                        className="flex items-center p-3 bg-gray-100 border border-dashed border-gray-300 rounded-md cursor-pointer transition-all hover:bg-gray-200"
                                    >
                                        <span className="text-2xl mr-3">📝</span>
                                        <span>Choose HTML Template</span>
                                    </label>
                                    {templateFileName && <span className="block mt-2 text-sm text-blue-600">{templateFileName}</span>}
                                </div>

                                <div className="h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-300"
                                        style={{ width: `${templateProgress}%` }}
                                    ></div>
                                </div>

                                <button
                                    className={`px-5 py-2 rounded-md ${uploadTemplateDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                    disabled={uploadTemplateDisabled}
                                    onClick={uploadTemplate}
                                >
                                    Upload Template
                                </button>
                            </div>
                        ) : (
                            <div>
                                <textarea
                                    id="template-content"
                                    className="w-full h-36 p-3 border border-gray-300 rounded-md mb-3 resize-y"
                                    placeholder="Paste your HTML template here..."
                                    value={templateContent}
                                    onChange={(e) => setTemplateContent(e.target.value)}
                                ></textarea>

                                <button
                                    className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={saveTemplate}
                                >
                                    Save Template
                                </button>
                            </div>
                        )}

                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800 mb-2">
                                <strong>Template Tips:</strong>
                            </p>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Use placeholder tags like {"{{name}}"} for dynamic content</li>
                                <li>• Upload images using the "Manage Images" button above</li>
                                <li>• Click "Insert" on any uploaded image to add it to your template</li>
                                <li>• Images are automatically optimized for email delivery</li>
                            </ul>
                        </div>

                        {templatePreview && (
                            <div className="mt-5 p-4 border border-gray-200 rounded-md min-h-24 bg-green-50 text-green-700">
                                {templatePreview}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            className={`px-5 py-2 rounded-md ${nextToStep2Disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            onClick={() => goToStep(2)}
                        >
                            Next: Configure
                        </button>
                    </div>
                </div>
            </div>

            {/* step 2 */}

            <div className={`${activeStep === 2 ? 'block' : 'hidden'}`}>
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h2 className="text-2xl text-blue-600 mb-5">Configure Email Settings</h2>
                    <div className="mb-8">
                        <h3 className="text-xl text-gray-800 mb-3">SMTP Settings</h3>

                        <div className="mb-4">
                            <label htmlFor="smtp-server" className="block mb-1 font-medium">SMTP Server</label>
                            <input
                                type="text"
                                id="smtp-server"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="e.g., smtp.gmail.com"
                                value={smtpServer}
                                onChange={(e) => setSmtpServer(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="smtp-port" className="block mb-1 font-medium">SMTP Port</label>
                            <select
                                id="smtp-port"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={smtpPort}
                                onChange={(e) => setSmtpPort(e.target.value)}
                            >
                                <option value="587">587 (TLS)</option>
                                <option value="465">465 (SSL)</option>
                                <option value="25">25 (Standard)</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email-user" className="block mb-1 font-medium">Email Address</label>
                            <input
                                type="email"
                                id="email-user"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="your@email.com"
                                value={emailUser}
                                onChange={(e) => setEmailUser(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email-pass" className="block mb-1 font-medium">Password/App Password</label>
                            <input
                                type="password"
                                id="email-pass"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Your password or app password"
                                value={emailPass}
                                onChange={(e) => setEmailPass(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="sender-name" className="block mb-1 font-medium">Sender Name</label>
                            <input
                                type="text"
                                id="sender-name"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Your Name or Company"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                            />
                        </div>

                        <button
                            className={`px-5 py-2 rounded-md ${testingConnection ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white flex items-center gap-2`}
                            onClick={testConnection}
                            disabled={testingConnection}
                        >
                            {testingConnection ? (
                                <>
                                    <Clock size={16} className="animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                <>
                                    <Settings size={16} />
                                    Test Connection
                                </>
                            )}
                        </button>

                        {connectionStatus && (
                            <div className={`mt-3 p-3 rounded-md flex items-center gap-2 ${connectionStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {connectionStatus === 'success' ? (
                                    <>
                                        <CheckCircle size={16} />
                                        Connection successful!
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle size={16} />
                                        Connection failed. Please check your settings.
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xl text-gray-800 mb-3">Email Configuration</h3>

                        <div className="mb-4">
                            <label htmlFor="email-column" className="block mb-1 font-medium">Email Column</label>
                            <select
                                id="email-column"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={selectedEmailColumn}
                                onChange={(e) => setSelectedEmailColumn(e.target.value)}
                            >
                                <option value="">Select column containing emails</option>
                                {emailColumns.map((column, index) => (
                                    <option key={index} value={column}>{column}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="name-column" className="block mb-1 font-medium">Name Column (optional)</label>
                            <select
                                id="name-column"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={selectedNameColumn}
                                onChange={(e) => setSelectedNameColumn(e.target.value)}
                            >
                                <option value="">Select column containing names</option>
                                {emailColumns.map((column, index) => (
                                    <option key={index} value={column}>{column}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="subject-line" className="block mb-1 font-medium">Email Subject Line</label>
                            <input
                                type="text"
                                id="subject-line"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Subject of your email"
                                value={subjectLine}
                                onChange={(e) => setSubjectLine(e.target.value)}
                            />
                            <p className="text-sm text-gray-500 mt-1">You can use {"{{name}}"} to personalize the subject</p>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="subject-line" className="block mb-1 font-medium">Campaign Name</label>
                            <input
                                type="text"
                                id="campaign-name"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Campaign Name"
                                value={campaignName}
                                onChange={(e) => setCampaignName(e.target.value)}
                            />

                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                            onClick={() => goToStep(1)}
                        >
                            Back
                        </button>
                        <button
                            className={`px-5 py-2 rounded-md ${nextToStep3Disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            // disabled={nextToStep3Disabled}
                            onClick={() => goToStep(3)}
                        >
                            Next: Personalize
                        </button>
                    </div>
                </div>
            </div>

            {/* Step 3: Personalize */}
            <div className={`${activeStep === 3 ? 'block' : 'hidden'}`}>
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h2 className="text-2xl text-blue-600 mb-5">Personalize Your Email</h2>

                    <div className="mb-8">
                        <h3 className="text-xl text-gray-800 mb-3">Map Data Fields to Template Variables</h3>
                        <p className="mb-4 text-gray-600">Connect your Excel data columns to template placeholder variables</p>

                        <div className="mb-4">
                            {variableMappings.map((mapping, index) => (
                                <div key={index} className="flex items-center gap-3 mb-4">
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border border-gray-300 rounded-md"
                                        placeholder="Template variable (e.g. name)"
                                        value={mapping.placeholder}
                                        onChange={(e) => updateVariableMapping(index, 'placeholder', e.target.value)}
                                    />
                                    <select
                                        className="flex-1 p-2 border border-gray-300 rounded-md"
                                        value={mapping.column}
                                        onChange={(e) => updateVariableMapping(index, 'column', e.target.value)}
                                    >
                                        <option value="">Select Excel column</option>
                                        {emailColumns.map((column, colIndex) => (
                                            <option key={colIndex} value={column}>{column}</option>
                                        ))}
                                    </select>
                                    <button
                                        className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600"
                                        onClick={() => removeVariableMapping(index)}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                            onClick={addVariableMapping}
                        >
                            Add Variable
                        </button>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xl text-gray-800 mb-3">Email Preview</h3>
                        <div className="p-4 border border-gray-200 rounded-md min-h-64 overflow-y-auto bg-gray-50">
                            <div className="mb-2 text-sm text-gray-600 border-b pb-2">
                                <strong>Subject:</strong> {subjectLine || 'No subject set'}
                            </div>
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: emailPreviewContent || 'Preview will appear here once the template is processed'
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                            onClick={() => goToStep(2)}
                        >
                            Back
                        </button>
                        <button
                            className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => goToStep(4)}
                        >
                            Next: Send
                        </button>
                    </div>
                </div>
            </div>

            {/* Step 4: Send */}
            <div className={`${activeStep === 4 ? 'block' : 'hidden'}`}>
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h2 className="text-2xl text-blue-600 mb-5">Review & Send</h2>

                    {!isSending && !sendingComplete && (
                        <div className="mb-8">
                            <h3 className="text-xl text-gray-800 mb-3">Sending Summary</h3>
                            <div className="bg-gray-100 p-4 rounded-md mb-5">
                                <div className="mb-2">
                                    <span className="font-semibold mr-2">Total Recipients:</span> {recipientCount}
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold mr-2">From:</span> {senderName} &lt;{emailUser}&gt;
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold mr-2">Subject:</span> {subjectLine}
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold mr-2">Email Column:</span> {selectedEmailColumn}
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold mr-2">Name Column:</span> {selectedNameColumn || 'Not selected'}
                                </div>
                                <div>
                                    <span className="font-semibold mr-2">SMTP Server:</span> {smtpServer}:{smtpPort}
                                </div>
                            </div>

                            <div className="mb-5">
                                <h4 className="font-semibold mb-2">Variable Mappings</h4>
                                <div className="bg-gray-50 p-3 rounded-md">
                                    {variableMappings.length > 0 && variableMappings.some(m => m.placeholder && m.column) ? (
                                        variableMappings.filter(m => m.placeholder && m.column).map((mapping, index) => (
                                            <div key={index} className="mb-1">
                                                <span className="text-blue-600">{"{{" + mapping.placeholder + "}}"}</span> → <span className="text-green-600">{mapping.column}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-gray-500">No custom variables mapped</span>
                                    )}
                                </div>
                            </div>

                            <div className="mb-5">
                                <h4 className="font-semibold mb-2">Sending Settings</h4>
                                <div className="mb-4">
                                    <label htmlFor="delay-emails" className="block mb-1">Delay Between Emails (ms)</label>
                                    <input
                                        type="number"
                                        id="delay-emails"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        min="500"
                                        value={delayBetweenEmails}
                                        onChange={(e) => setDelayBetweenEmails(parseInt(e.target.value) || 2000)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Recommended: 1000ms - 5000ms to avoid being flagged as spam</p>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    className="px-8 py-3 rounded-md bg-green-600 text-white text-lg hover:bg-green-700 flex items-center gap-2"
                                    onClick={startSending}
                                >
                                    <Mail size={20} />
                                    Start Sending ({recipientCount} emails)
                                </button>
                            </div>
                        </div>
                    )}

                    {(isSending || sendingComplete) && (
                        <div className="mb-8">
                            <h3 className="text-xl text-gray-800 mb-3">Sending Progress</h3>

                            <div className="bg-gray-100 p-4 rounded-md mb-5">
                                <div className="flex justify-between items-center mb-2">
                                    <span>Progress: {Math.round(sendingProgress)}%</span>
                                    <span>{sentCount + failedCount} / {recipientCount}</span>
                                </div>
                                <div className="h-3 bg-gray-300 rounded-full mb-4">
                                    <div
                                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                        style={{ width: `${sendingProgress}%` }}
                                    ></div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-3">
                                    <div className="text-center">
                                        <div className="text-3xl font-semibold text-green-600">{sentCount}</div>
                                        <div className="text-sm text-gray-600">Sent</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-semibold text-red-600">{failedCount}</div>
                                        <div className="text-sm text-gray-600">Failed</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-semibold text-blue-600">{remainingCount}</div>
                                        <div className="text-sm text-gray-600">Remaining</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-5">
                                <h4 className="font-semibold mb-2">Sending Logs</h4>
                                <div className="border border-gray-200 rounded-md h-64 overflow-y-auto p-2 bg-gray-50">
                                    {sendingLogs.map((log) => (
                                        <div
                                            key={log.id}
                                            className={`px-3 py-2 mb-1 rounded-md text-sm ${log.type === 'success' ? 'bg-green-50 text-green-700 border-l-2 border-green-400' :
                                                log.type === 'error' ? 'bg-red-50 text-red-700 border-l-2 border-red-400' :
                                                    'bg-blue-50 text-blue-700 border-l-2 border-blue-400'
                                                }`}
                                        >
                                            <span className="text-gray-500 text-xs mr-2">{log.time}</span>
                                            {log.message}
                                        </div>
                                    ))}
                                    {sendingLogs.length === 0 && (
                                        <div className="text-center text-gray-500 p-4">Logs will appear here as emails are sent...</div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                {isSending ? (
                                    <button
                                        className="px-8 py-3 rounded-md bg-red-600 text-white text-lg hover:bg-red-700"
                                        onClick={stopSending}
                                    >
                                        Stop Sending
                                    </button>
                                ) : sendingComplete && (
                                    <button
                                        className="px-8 py-3 rounded-md bg-blue-600 text-white text-lg hover:bg-blue-700"
                                        onClick={startOver}
                                    >
                                        Start Over
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {!isSending && !sendingComplete && (
                        <div className="flex justify-between">
                            <button
                                className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                                onClick={() => goToStep(3)}
                            >
                                Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
         </div >

    );
};