import { useState, useCallback, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
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
  const [pinchScale, setPinchScale] = useState(1.0);
  const [isPinching, setIsPinching] = useState(false);
  const containerRef = useRef(null);
  const pageRefs = useRef({});
  const [isLoading, setIsLoading] = useState(true);
  const pinchStateRef = useRef({
    isPinching: false,
    anchorPage: null,
    anchorOffsetY: 0,
    anchorViewportY: 0,
    finalScale: null,
  });

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

  // Prevent browser viewport zoom on pinch inside the PDF container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const preventNativeZoom = (event) => {
      if (event.touches && event.touches.length > 1) {
        event.preventDefault();
      }
    };

    container.addEventListener('touchstart', preventNativeZoom, { passive: false });
    container.addEventListener('touchmove', preventNativeZoom, { passive: false });

    return () => {
      container.removeEventListener('touchstart', preventNativeZoom);
      container.removeEventListener('touchmove', preventNativeZoom);
    };
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

  // Pointer-based pinch-to-zoom (mobile-friendly)
  const activePointersRef = useRef(new Map());
  const initialDistanceRef = useRef(null);
  const initialScaleRef = useRef(1.0);

  const getPointerDistance = (p1, p2) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getPointerMidpoint = (p1, p2) => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  });

  const findPageAtY = (screenY) => {
    const pages = Object.values(pageRefs.current);
    for (const pageEl of pages) {
      if (!pageEl) continue;
      const rect = pageEl.getBoundingClientRect();
      if (screenY >= rect.top && screenY <= rect.bottom) {
        return pageEl;
      }
    }
    return null;
  };

  const handlePointerDown = useCallback((e) => {
    if (e.pointerType !== 'touch') return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);

    if (activePointersRef.current.size === 2) {
      const points = Array.from(activePointersRef.current.values());
      initialDistanceRef.current = getPointerDistance(points[0], points[1]);
      initialScaleRef.current = scale;
      setIsPinching(true);
      setPinchScale(1.0);
      const midpoint = getPointerMidpoint(points[0], points[1]);
      const container = containerRef.current;
      const pageEl = findPageAtY(midpoint.y);
      if (container && pageEl) {
        const containerRect = container.getBoundingClientRect();
        const pageRect = pageEl.getBoundingClientRect();
        const state = pinchStateRef.current;
        state.isPinching = true;
        state.anchorPage = parseInt(pageEl.dataset.pageNumber);
        state.anchorOffsetY = midpoint.y - pageRect.top;
        state.anchorViewportY = midpoint.y - containerRect.top;
      }
    }
  }, [scale]);

  const handlePointerMove = useCallback((e) => {
    if (e.pointerType !== 'touch') return;
    if (!activePointersRef.current.has(e.pointerId)) return;

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 2 && initialDistanceRef.current) {
      e.preventDefault();
      const points = Array.from(activePointersRef.current.values());
      const currentDistance = getPointerDistance(points[0], points[1]);
      const ratio = currentDistance / initialDistanceRef.current;
      const nextScale = Math.max(0.5, Math.min(3.0, initialScaleRef.current * ratio));
      pinchStateRef.current.finalScale = nextScale;
      setPinchScale(nextScale / initialScaleRef.current);
    }
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (e.pointerType !== 'touch') return;
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) {
      initialDistanceRef.current = null;
      const state = pinchStateRef.current;
      state.isPinching = false;
      state.anchorPage = null;
      setIsPinching(false);
      if (state.finalScale) {
        setScale(state.finalScale);
      }
      state.finalScale = null;
      setPinchScale(1.0);
    }
  }, []);

  useLayoutEffect(() => {
    const state = pinchStateRef.current;
    if (!state.isPinching || !state.anchorPage) return;
    const container = containerRef.current;
    const pageEl = pageRefs.current[state.anchorPage];
    if (!container || !pageEl) return;

    const rafId = requestAnimationFrame(() => {
      const nextTop = pageEl.offsetTop + state.anchorOffsetY - state.anchorViewportY;
      container.scrollTop = Math.max(0, nextTop);
    });

    return () => cancelAnimationFrame(rafId);
  }, [scale]);

  // Scroll to specific page
  const scrollToPage = (pageNumber) => {
    const pageRef = pageRefs.current[pageNumber];
    if (pageRef) {
      pageRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const displayScale = isPinching ? scale * pinchScale : scale;

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
            <span className="zoom-display">{Math.round(displayScale * 100)}%</span>
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading PDF...</p>
          </div>
        )}
        
        <div
          className={`pdf-pages ${isPinching ? 'pdf-pages--pinching' : ''}`}
          style={{ transform: `scale(${pinchScale})` }}
        >
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
                    width={containerWidth ? Math.min(containerWidth - 40, 800) : undefined}
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
    </div>
  );
};

export default PDFViewer;
