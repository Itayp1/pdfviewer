import PDFViewer from "./components/PDFViewer";
import "./App.css";

function App() {
  // Local PDF served from the public folder
  const pdfUrl = "/sample.pdf";

  return (
    <div className="app">
      <PDFViewer pdfUrl={pdfUrl} />
    </div>
  );
}

export default App;
