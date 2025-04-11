import { NextResponse } from 'next/server';
import axios from 'axios';
import qs from 'qs';

export async function POST(req) {
  try {
    const { phone, userName, location } = await req.json();

    const SID = process.env.EXOTEL_SID;
    const TOKEN = process.env.EXOTEL_TOKEN;
    const CALLER_ID = process.env.EXOTEL_CALLER_ID;

    const EXOTEL_URL = `https://api.exotel.com/v1/Accounts/${SID}/Calls/connect.json`;

    const callData = {
      From: phone,
      To: CALLER_ID,
      CallerId: CALLER_ID,
      StatusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/call-status`,
      // Optional: Add custom variables for the call flow
      CustomField: `Name=${userName}&Location=${encodeURIComponent(location)}`
    };

    const response = await axios.post(EXOTEL_URL, qs.stringify(callData), {
      auth: { username: SID, password: TOKEN },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Emergency call initiated',
      data: response.data 
    });

  } catch (error) {
    console.error('SOS Call Error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to initiate emergency call' },
      { status: 500 }
    );
  }
}