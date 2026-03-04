import { NextRequest, NextResponse } from 'next/server'

const PINTEREST_API = 'https://api.pinterest.com/v5'
const POLL_INTERVAL_MS = 5000
const POLL_MAX_ATTEMPTS = 60 // 5 minutes max

async function createImagePin(
  accessToken: string,
  boardId: string,
  title: string,
  description: string,
  link: string,
  coverImageUrl: string,
  tags: string[] = []
) {
  let pinDescription = description.slice(0, 500)
  if (tags.length > 0) {
    const hashtags = tags.map((t) => `#${t.replace(/^#/, '')}`).join(' ')
    pinDescription = pinDescription ? `${pinDescription} ${hashtags}` : hashtags
  }

  const res = await fetch(`${PINTEREST_API}/pins`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      board_id: boardId,
      title,
      description: pinDescription.slice(0, 500),
      link,
      media_source: {
        source_type: 'image_url',
        url: coverImageUrl,
        content_type: 'image/jpeg',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Pinterest create pin failed: ${res.status} ${err}`)
  }

  return res.json()
}

async function createVideoPin(
  accessToken: string,
  boardId: string,
  title: string,
  description: string,
  link: string,
  coverImageUrl: string,
  videoBuffer: ArrayBuffer,
  videoContentType: string,
  tags: string[] = []
) {
  // Step A: Register media
  const regRes = await fetch(`${PINTEREST_API}/media`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ media_type: 'video' }),
  })

  if (!regRes.ok) {
    const err = await regRes.text()
    throw new Error(`Pinterest media register failed: ${regRes.status} ${err}`)
  }

  const regData = await regRes.json()
  const { media_id, upload_url, upload_parameters } = regData

  if (!media_id || !upload_url || !upload_parameters) {
    throw new Error('Invalid response from Pinterest media register')
  }

  // Step B: Upload video to S3
  const formData = new FormData()
  for (const [key, value] of Object.entries(upload_parameters)) {
    formData.append(key, value as string)
  }
  formData.append('file', new Blob([videoBuffer], { type: videoContentType }), 'video.mp4')

  const uploadRes = await fetch(upload_url, {
    method: 'POST',
    body: formData,
  })

  if (!uploadRes.ok) {
    const err = await uploadRes.text()
    throw new Error(`Pinterest video upload failed: ${uploadRes.status} ${err}`)
  }

  // Step C: Poll until processing complete
  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))

    const statusRes = await fetch(`${PINTEREST_API}/media/${media_id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!statusRes.ok) throw new Error('Failed to check media status')

    const statusData = await statusRes.json()
    const status = statusData?.status

    if (status === 'succeeded') break
    if (status === 'failed') throw new Error('Pinterest video processing failed')
    if (i === POLL_MAX_ATTEMPTS - 1) throw new Error('Video processing timed out (5 min)')
  }

  // Step D: Create pin with video
  const mediaSource: Record<string, string> = {
    source_type: 'video_id',
    media_id,
  }
  if (coverImageUrl) {
    mediaSource.cover_image_url = coverImageUrl
    mediaSource.cover_image_content_type = 'image/jpeg'
  }

  let pinDescription = description.slice(0, 500)
  if (tags.length > 0) {
    const hashtags = tags.map((t) => `#${t.replace(/^#/, '')}`).join(' ')
    pinDescription = pinDescription ? `${pinDescription} ${hashtags}` : hashtags
  }

  const pinRes = await fetch(`${PINTEREST_API}/pins`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      board_id: boardId,
      title,
      description: pinDescription.slice(0, 500),
      link,
      media_source: mediaSource,
    }),
  })

  if (!pinRes.ok) {
    const err = await pinRes.text()
    throw new Error(`Pinterest create pin failed: ${pinRes.status} ${err}`)
  }

  return pinRes.json()
}

export async function POST(request: NextRequest) {
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Pinterest access token not configured' },
      { status: 500 }
    )
  }

  try {
    const contentType = request.headers.get('content-type') || ''
    let boardId: string
    let title: string
    let description: string
    let link: string
    let coverImageUrl: string
    let tags: string[] = []
    let videoData: { buffer: ArrayBuffer; contentType: string } | null = null

    if (contentType.includes('application/json')) {
      const body = await request.json()
      boardId = body.boardId
      title = body.title
      description = body.description || ''
      link = body.link
      coverImageUrl = body.coverImageUrl || ''
      tags = body.tags || []

      if (body.videoUrl && typeof body.videoUrl === 'string') {
        const res = await fetch(body.videoUrl)
        if (res.ok) {
          videoData = {
            buffer: await res.arrayBuffer(),
            contentType: res.headers.get('content-type') || 'video/mp4',
          }
        }
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      boardId = formData.get('boardId') as string
      title = formData.get('title') as string
      description = (formData.get('description') as string) || ''
      link = formData.get('link') as string
      coverImageUrl = (formData.get('coverImageUrl') as string) || ''
      const tagsStr = formData.get('tags') as string
      tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : []

      const file = formData.get('video') as File | null
      if (file) {
        videoData = {
          buffer: await file.arrayBuffer(),
          contentType: file.type || 'video/mp4',
        }
      }
    } else {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    if (!boardId || !title || !link) {
      return NextResponse.json(
        { error: 'boardId, title, and link are required' },
        { status: 400 }
      )
    }

    if (videoData) {
      const result = await createVideoPin(
        accessToken,
        boardId,
        title,
        description,
        link,
        coverImageUrl,
        videoData.buffer,
        videoData.contentType,
        tags
      )
      const pinUrl = result?.link || `https://www.pinterest.com/pin/${result?.id || ''}`
      return NextResponse.json({ pinUrl, pinId: result?.id })
    }

    if (coverImageUrl) {
      const result = await createImagePin(
        accessToken,
        boardId,
        title,
        description,
        link,
        coverImageUrl,
        tags
      )
      const pinUrl = result?.link || `https://www.pinterest.com/pin/${result?.id || ''}`
      return NextResponse.json({ pinUrl, pinId: result?.id })
    }

    return NextResponse.json(
      { error: 'Provide either videoUrl (or video file) or coverImageUrl' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Pinterest create pin error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create Pinterest pin'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
