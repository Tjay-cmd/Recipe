import { NextResponse } from 'next/server'

export async function GET() {
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Pinterest access token not configured. Add PINTEREST_ACCESS_TOKEN to .env.local' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch('https://api.pinterest.com/v5/boards', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Pinterest boards API error:', response.status, errorText)
      return NextResponse.json(
        { error: `Pinterest API error: ${response.status}` },
        { status: 502 }
      )
    }

    const data = await response.json()
    const items = data?.items || []

    const boards = items.map((board: { id?: string; name?: string }) => ({
      id: board.id,
      name: board.name || 'Unnamed Board',
    }))

    return NextResponse.json({ boards })
  } catch (error) {
    console.error('Pinterest boards fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Pinterest boards' },
      { status: 500 }
    )
  }
}
