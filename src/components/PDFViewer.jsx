import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PDFViewer.css';

// Configure PDF.js worker - using copied worker file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const PDFViewer = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState(null);
  const containerRef = useRef(null);
  const pageRefs = useRef({});
  const [isLoading, setIsLoading] = useState(true);

  // Handle successful document load
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  // Handle document load error
  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
  };

  // Memoize document options to prevent re-creation
  const documentOptions = useMemo(() => ({
    httpHeaders: {
      'Accept': 'application/pdf',
    },
    withCredentials: false,
  }), []);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Intersection Observer to track current page during scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const pageNumber = parseInt(entry.target.dataset.pageNumber);
            setCurrentPage(pageNumber);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-50px 0px',
      }
    );

    // Observe all page elements
    Object.values(pageRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [numPages]);

  // Zoom controls
  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  // Touch event handling for pinch-to-zoom
  const [initialDistance, setInitialDistance] = useState(null);
  const [initialScale, setInitialScale] = useState(1.0);

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setInitialDistance(getTouchDistance(e.touches));
      setInitialScale(scale);
    }
  }, [scale]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && initialDistance) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const newScale = initialScale * (currentDistance / initialDistance);
      setScale(Math.max(0.5, Math.min(3.0, newScale)));
    }
  }, [initialDistance, initialScale]);

  const handleTouchEnd = useCallback(() => {
    setInitialDistance(null);
  }, []);

  // Scroll to specific page
  const scrollToPage = (pageNumber) => {
    const pageRef = pageRefs.current[pageNumber];
    if (pageRef) {
      pageRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="pdf-viewer-container">
      {/* Header with controls */}
      <div className="pdf-viewer-header">
        <div className="pdf-viewer-title">
          <h1>PDF Viewer</h1>
        </div>
        
        <div className="pdf-viewer-controls">
          {/* Page navigation */}
          <div className="page-info">
            <button
              onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="nav-button"
              aria-label="Previous page"
            >
              ←
            </button>
            <span className="page-display">
              Page {currentPage} of {numPages || '—'}
            </span>
            <button
              onClick={() => scrollToPage(Math.min(numPages, currentPage + 1))}
              disabled={currentPage >= numPages}
              className="nav-button"
              aria-label="Next page"
            >
              →
            </button>
          </div>

          {/* Zoom controls */}
          <div className="zoom-controls">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="zoom-button"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="zoom-display">{Math.round(scale * 100)}%</span>
            <button
              onClick={zoomIn}
              disabled={scale >= 3.0}
              className="zoom-button"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              onClick={resetZoom}
              className="reset-button"
              aria-label="Reset zoom"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* PDF Document Container */}
      <div
        className="pdf-document-container"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading PDF...</p>
          </div>
        )}
        
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          options={documentOptions}
          loading={<div className="loading-placeholder">Loading document...</div>}
          error={<div className="error-message">Failed to load PDF. Please check the URL and try again.</div>}
        >
          {Array.from(new Array(numPages), (el, index) => {
            const pageNumber = index + 1;
            return (
              <div
                key={`page_${pageNumber}`}
                ref={(el) => (pageRefs.current[pageNumber] = el)}
                data-page-number={pageNumber}
                className="pdf-page-wrapper"
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  width={containerWidth ? Math.min(containerWidth - 40, 800 * scale) : undefined}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={
                    <div className="page-loading">
                      Loading page {pageNumber}...
                    </div>
                  }
                />
                <div className="page-number-label">Page {pageNumber}</div>
              </div>
            );
          })}
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
