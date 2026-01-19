# PDF Viewer Setup

The PDF viewer uses `react-native-webview` to display PDFs in-app instead of opening them in an external browser.

## Installation

If you haven't installed `react-native-webview` yet, run:

```bash
npx expo install react-native-webview
```

Or if that doesn't work:

```bash
npm install react-native-webview
```

## How It Works

1. When a user taps "Open PDF" on a PDF resource, they're navigated to `/pdf-viewer`
2. The PDF viewer uses Google Docs Viewer to render the PDF in a WebView
3. The PDF stays within the app, providing a better user experience
4. External links still open in the browser (as expected)

## Features

- In-app PDF viewing
- Loading indicators
- Error handling
- Back navigation
- Title display

## Notes

- PDFs are loaded through Google Docs Viewer for better compatibility
- The original PDF URL is preserved and passed to the viewer
- If a PDF fails to load, users can still access it via the external link option
