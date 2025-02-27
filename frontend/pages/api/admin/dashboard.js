import { NextResponse } from 'next/server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { range } = req.query;
    
    // Appel à votre backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard?range=${range}`, {
      headers: {
        'Authorization': req.headers.authorization,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 