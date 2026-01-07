import PDFViewer from './components/PDFViewer'
import './App.css'

function App() {
  // Production URL - the Hebrew contract PDF
  const pdfUrl = 'https://www.kavlaoved.org.il/wp-content/uploads/2014/09/%D7%97%D7%95%D7%96%D7%94-%D7%94%D7%A2%D7%A1%D7%A7%D7%94.pdf';
  
  // For testing with local PDF, use:
  // const pdfUrl = '/sample.pdf';

  return (
    <div className="app">
      <PDFViewer pdfUrl={pdfUrl} />
    </div>
  )
}

export default App
