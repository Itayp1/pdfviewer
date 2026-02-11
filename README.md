# PDF Viewer - Responsive React Application

A modern, responsive PDF viewer application built with React and Vite. This application displays PDF documents with full support for desktop and mobile devices, featuring intuitive navigation, zoom controls, and pinch-to-zoom gestures on mobile.

## Features

✨ **Core Functionality:**
- 📄 Display PDF documents from URLs
- 🖥️ Responsive design for desktop and mobile devices
- 📱 Touch-friendly interface
- 🔄 Smooth page navigation with scroll support
- 📊 Display current page and total page count
- 🔍 Zoom in/out controls (50% - 300%)
- 👆 Pinch-to-zoom gesture support on mobile devices
- ⌨️ Keyboard-accessible controls

## Screenshots

### Desktop View
![PDF Viewer Desktop](https://github.com/user-attachments/assets/8cc849f9-aa3d-455c-9aac-a216aa4d0784)

### Zoomed View (120%)
![PDF Viewer Zoomed](https://github.com/user-attachments/assets/16a1e3d8-195c-455c-a33f-5dc22c4af68c)

### Mobile View
![PDF Viewer Mobile](https://github.com/user-attachments/assets/7b3b11ee-46b8-41a4-9bbe-76abfb79d5a2)

## Technology Stack

- **React** 19.2.0 - UI framework
- **Vite** 7.2.4 - Build tool and dev server
- **react-pdf** 10.3.0 - PDF rendering library
- **PDF.js** - Mozilla's PDF rendering engine

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Itayp1/pdfviewer.git
cd pdfviewer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173/`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Changing the PDF URL

To display a different PDF, edit the `pdfUrl` in `src/App.jsx`:

```javascript
const pdfUrl = 'https://example.com/your-document.pdf';
```

### Local PDF Files

To use a local PDF file, place it in the `public/` directory and reference it:

```javascript
const pdfUrl = '/your-document.pdf';
```

## Controls

### Desktop
- **Navigation:** Use arrow buttons or scroll through pages
- **Zoom:** Click + and - buttons, or use the Reset button to return to 100%
- **Page Display:** Current page and total pages shown in the header

### Mobile
- **Navigation:** Scroll up/down to navigate pages
- **Zoom:** Use + and - buttons
- **Pinch-to-Zoom:** Use two-finger pinch gesture to zoom in/out
- **Touch Controls:** All buttons are touch-optimized (minimum 44px touch targets)

## Project Structure

```
pdfviewer/
├── public/              # Static assets
│   └── sample.pdf      # Sample PDF for testing
├── src/
│   ├── components/
│   │   ├── PDFViewer.jsx    # Main PDF viewer component
│   │   └── PDFViewer.css    # Component styles
│   ├── App.jsx         # Main application component
│   ├── App.css         # Application styles
│   ├── index.css       # Global styles
│   └── main.jsx        # Application entry point
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies and scripts
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Limitations

- External PDF URLs must have proper CORS headers configured
- Very large PDF files may take longer to load
- Some PDF features (forms, annotations) are disabled for performance

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

This project follows React best practices and uses ESLint for code quality.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with [react-pdf](https://github.com/wojtekmaj/react-pdf) by Wojciech Maj
- PDF rendering powered by [PDF.js](https://mozilla.github.io/pdf.js/) from Mozilla
- Scaffolded with [Vite](https://vitejs.dev/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
