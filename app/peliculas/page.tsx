import MovieGallery from './MovieGallery'

interface Movie {
  Title: string
  Year: string
  imdbID: string
  Type: string
  Poster: string
}

interface MovieDetails extends Movie {
  Response: string
  Error?: string
}

const featuredTitles = [
  'Interstellar',
  'The Matrix',
  'Inception',
  'The Dark Knight',
  'Breaking Bad',
  'Stranger Things'
]

async function getFeaturedMovies(): Promise<Movie[]> {
  const apiKey = process.env.OMDB_API_KEY

  if (!apiKey) {
    throw new Error(
      'Configura OMDB_API_KEY en el archivo .env.local.'
    )
  }

  const requests = featuredTitles.map(async (title) => {
    const params = new URLSearchParams({
      apikey: apiKey,
      t: title,
      plot: 'short'
    })

    const response = await fetch(
      'https://www.omdbapi.com/?' + params.toString(),
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      return null
    }

    const data: MovieDetails = await response.json()

    if (data.Response === 'False' || !data.imdbID) {
      return null
    }

    return {
      Title: data.Title,
      Year: data.Year,
      imdbID: data.imdbID,
      Type: data.Type,
      Poster: data.Poster
    }
  })

  const movies = await Promise.all(requests)

  return movies.filter(
    (movie): movie is Movie => movie !== null
  )
}

export default async function PeliculasPage() {
  const movies = await getFeaturedMovies()

  return (
    <main className="min-h-screen bg-[#10121b] text-white">
      <header className="border-b border-white/10 bg-[#10121b]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a
            href="/peliculas"
            className="text-2xl font-black tracking-tight"
          >
            Cine<span className="text-amber-400">Scope</span>
          </a>

          <span className="text-sm text-gray-400">
            Películas y series
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-amber-400">
            Tu próxima historia empieza aquí
          </p>

          <h1 className="text-4xl font-black sm:text-6xl">
            Explora el universo
            <br />
            del cine y las series.
          </h1>

          <p className="mt-4 max-w-2xl text-gray-400">
            Descubre títulos, consulta información y encuentra
            tu próxima película favorita.
          </p>
        </div>

        <MovieGallery featuredMovies={movies} />
      </section>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-sm text-gray-500">
        CineScope · Datos proporcionados por OMDb API
      </footer>
    </main>
  )
}