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
    const id = searchParams.get('id')?.trim() || ''

    if (!/^tt\d+$/.test(id)) {
      return NextResponse.json(
        { Error: 'El identificador IMDb no es válido.' },
        { status: 400 }
      )
    }

    const params = new URLSearchParams({
      apikey: apiKey,
      i: id,
      plot: 'full'
    })

    const response = await fetch(
      'https://www.omdbapi.com/?' + params.toString(),
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return NextResponse.json(
        { Error: 'No se pudo consultar el detalle.' },
        { status: 502 }
      )
    }

    const data = await response.json()

    if (data.Response === 'False') {
      return NextResponse.json(
        { Error: data.Error || 'No se encontraron detalles.' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { Error: 'Ocurrió un error al obtener los detalles.' },
      { status: 500 }
    )
  }
}