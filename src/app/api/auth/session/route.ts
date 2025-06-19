import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const itsNoCookie = (await cookieStore).get('its_no');

  if (itsNoCookie) {
    return NextResponse.json({ its_no: itsNoCookie.value });
  } else {
    return NextResponse.json({ error: 'its_no cookie not found' }, { status: 401 });
  }
}