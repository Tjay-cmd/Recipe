import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const rapidApiKey = process.env.RAPIDAPI_KEY
  if (!rapidApiKey) {
    return NextResponse.json({ error: 'RapidAPI key not configured' }, { status: 500 })
  }

  let pinterestUrl: string
  try {
    const body = await request.json()
    pinterestUrl = body.tiktokUrl // keep same field name to avoid changing admin page fetch call
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!pinterestUrl || typeof pinterestUrl !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  if (!pinterestUrl.includes('pinterest.com') && !pinterestUrl.includes('pin.it')) {
    return NextResponse.json({ error: 'Invalid Pinterest URL' }, { status: 400 })
  }

  try {
    // Step 1: Call RapidAPI to get the download URL
    const apiResponse = await fetch(
      `https://pinterest-video-and-image-downloader.p.rapidapi.com/pinterest?url=${encodeURIComponent(pinterestUrl)}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'pinterest-video-and-image-downloader.p.rapidapi.com',
          'x-rapidapi-key': rapidApiKey,
        },
      }
    )

    const responseText = await apiResponse.text()

    if (!apiResponse.ok) {
      console.error('RapidAPI error:', apiResponse.status, responseText)
      return NextResponse.json(
        { error: `RapidAPI error ${apiResponse.status}: ${responseText.slice(0, 200)}` },
        { status: 502 }
      )
    }

    let data: any
    try {
      data = JSON.parse(responseText)
    } catch {
      console.error('RapidAPI non-JSON response:', responseText)
      return NextResponse.json(
        { error: `Unexpected API response: ${responseText.slice(0, 200)}` },
        { status: 502 }
      )
    }

    // Extract the download URL — covers common response shapes from this API
    const mediaUrl: string =
      data?.url ||
      data?.video_url ||
      data?.urls?.[0] ||
      data?.data?.url ||
      data?.data?.video_url ||
      data?.data?.urls?.[0] ||
      data?.data?.images?.[0]

    if (!mediaUrl) {
      console.error('Could not find media URL in response:', JSON.stringify(data))
      return NextResponse.json(
        { error: `Could not extract download URL. API returned: ${JSON.stringify(data).slice(0, 300)}` },
        { status: 502 }
      )
    }

    // Step 2: Fetch the actual media bytes and stream to client
    const mediaResponse = await fetch(mediaUrl)

    if (!mediaResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch media from download URL' },
        { status: 502 }
      )
    }

    // Detect content type to set correct extension
    const contentType = mediaResponse.headers.get('content-type') || 'video/mp4'
    const isImage = contentType.startsWith('image/')
    const ext = isImage ? (contentType.includes('png') ? 'png' : 'jpg') : 'mp4'

    const now = new Date()
    const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 15)
    const filename = `pinterest_${timestamp}.${ext}`

    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    })

    const contentLength = mediaResponse.headers.get('content-length')
    if (contentLength) headers.set('Content-Length', contentLength)

    return new NextResponse(mediaResponse.body, { status: 200, headers })
  } catch (error) {
    console.error('Pinterest download error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
