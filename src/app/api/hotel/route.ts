import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  // Check if Google Sheets environment variables are configured
  const hasGoogleConfig = 
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL && 
    process.env.GOOGLE_SHEETS_PRIVATE_KEY && 
    process.env.GOOGLE_SPREADSHEET_ID;

  if (!hasGoogleConfig) {
    const missingVars = [];
    if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL) missingVars.push("GOOGLE_SHEETS_CLIENT_EMAIL");
    if (!process.env.GOOGLE_SHEETS_PRIVATE_KEY) missingVars.push("GOOGLE_SHEETS_PRIVATE_KEY");
    if (!process.env.GOOGLE_SPREADSHEET_ID) missingVars.push("GOOGLE_SPREADSHEET_ID");
    
    return NextResponse.json({ 
      success: false, 
      message: `Google Sheets configuration incomplete. Missing environment variables: ${missingVars.join(", ")}`,
      error: "MISSING_CREDENTIALS"
    }, { status: 500 });
  }

  try {
    // Clean and validate the private key
    let privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY!;
    
    // Replace escaped newlines with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Validate private key format
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid private key format. Make sure it includes BEGIN and END markers.',
        error: "INVALID_PRIVATE_KEY"
      }, { status: 500 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: "Sheet1!A:B", // Name and Address columns only
    });

    const rows = response.data.values;
    console.log("Successfully fetched data from Google Sheets:", rows?.length || 0, "rows");
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "No data found in the Google Sheet or the sheet is empty",
        error: "NO_DATA_FOUND"
      }, { status: 404 });
    }

    // Skip header row and filter out empty rows
    const hotels = rows
      .slice(1)
      .filter(row => row[0] && row[1]) // Filter out rows where name or address is empty
      .map((row, index) => ({
        id: index + 1,
        name: row[0],
        address: row[1],
      }));

    if (hotels.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "No valid hotel data found in the Google Sheet (all rows are empty or incomplete)",
        error: "NO_VALID_DATA"
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: hotels });
  } catch (error: any) {
    console.error("Error fetching hotels from Google Sheets:", error.message);
    
    // Handle specific Google Sheets API errors
    if (error.message.includes("Requested entity was not found")) {
       return NextResponse.json({ 
         success: false, 
         message: "Google Sheet not found. Please check: 1) The GOOGLE_SPREADSHEET_ID is correct, 2) The sheet named 'Sheet1' exists in your spreadsheet, 3) The service account has been given access to the spreadsheet (share the sheet with the service account email)",
         error: "SHEET_NOT_FOUND"
       }, { status: 404 });
     }
    
    if (error.message.includes("The caller does not have permission")) {
      return NextResponse.json({ 
        success: false, 
        message: "Permission denied. Please share your Google Sheet with the service account email from GOOGLE_SHEETS_CLIENT_EMAIL",
        error: "PERMISSION_DENIED"
      }, { status: 403 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: `Failed to fetch data from Google Sheets: ${error.message}`,
      error: "GOOGLE_SHEETS_ERROR"
    }, { status: 500 });
  }
}
