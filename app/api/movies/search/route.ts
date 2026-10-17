import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const apiKey = process.env.OMDB_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { Error: 'No se ha configurado la API key de OMDb.' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() || ''
    const type = searchParams.get('type') || 'all'

    if (query.length < 2) {
      return NextResponse.json({
        Search: [],
        totalResults: '0',
        Response: 'False',
        Error: 'Escribe al menos dos caracteres.'
      })
    }

    const params = new URLSearchParams({
      apikey: apiKey,
      s: query,
      page: '1'
    })

    if (type === 'movie' || type === 'series') {
      params.set('type', type)
    }

    const response = await fetch(
      'https://www.omdbapi.com/?' + params.toString(),
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return NextResponse.json(
        { Error: 'No se pudo consultar OMDb.' },
        { status: 502 }
      )
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { Error: 'Ocurrió un error al buscar películas.' },
      { status: 500 }
    )
  }
}