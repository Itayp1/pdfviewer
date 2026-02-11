# CORS Configuration Note

## External PDF URLs

The application is configured to load the PDF from:
```
https://www.kavlaoved.org.il/wp-content/uploads/2014/09/%D7%97%D7%95%D7%96%D7%94-%D7%94%D7%A2%D7%A1%D7%A7%D7%94.pdf
```

## Important Notes

1. **CORS Requirements**: External PDF URLs must have proper CORS (Cross-Origin Resource Sharing) headers configured on their server. The PDF server should include:
   ```
   Access-Control-Allow-Origin: *
   ```
   or specify the exact origin of your application.

2. **Testing Locally**: For local testing, a sample PDF is included at `/public/sample.pdf`. You can switch to it in `src/App.jsx`:
   ```javascript
   const pdfUrl = '/sample.pdf';
   ```

3. **Alternative Solutions** if CORS is an issue:
   - **Server Proxy**: Set up a backend proxy that fetches the PDF and serves it
   - **Download and Host**: Download the PDF and host it in your `public/` directory
   - **CORS Proxy Service**: Use a CORS proxy service (not recommended for production)

4. **Production Deployment**: When deploying to production, ensure:
   - The PDF URL is accessible from your deployment domain
   - The PDF server allows CORS requests from your domain
   - HTTPS is used for both your app and the PDF URL

## Verifying CORS

You can check CORS headers using curl:
```bash
curl -I https://www.kavlaoved.org.il/wp-content/uploads/2014/09/%D7%97%D7%95%D7%96%D7%94-%D7%94%D7%A2%D7%A1%D7%A7%D7%94.pdf
```

Look for `Access-Control-Allow-Origin` in the response headers.
