'use client'

import { useEffect, useState } from 'react'

interface Movie {
  Title: string
  Year: string
  imdbID: string
  Type: string
  Poster: string
}

interface MovieDetails extends Movie {
  Plot?: string
  Genre?: string
  Director?: string
  Actors?: string
  Runtime?: string
  imdbRating?: string
  Rated?: string
  Released?: string
  Language?: string
  Country?: string
  Awards?: string
  Response?: string
  Error?: string
}

interface SearchResponse {
  Search?: Movie[]
  Response: string
  Error?: string
  totalResults?: string
}

interface MovieGalleryProps {
  featuredMovies: Movie[]
}

export default function MovieGallery({
  featuredMovies
}: MovieGalleryProps) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [results, setResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedMovie, setSelectedMovie] =
    useState<MovieDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')

  useEffect(() => {
    const searchText = query.trim()

    if (searchText.length < 2) {
      setResults([])
      setLoading(false)
      setError('')
      return
    }

    let cancelled = false

    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams({
          q: searchText,
          type: type
        })

        const response = await fetch(
          '/api/movies/search?' + params.toString()
        )

        const data: SearchResponse = await response.json()

        if (!response.ok) {
          throw new Error(
            data.Error || 'No se pudo realizar la búsqueda.'
          )
        }

        if (cancelled) {
          return
        }

        if (data.Response === 'False') {
          setResults([])
          setError(data.Error || 'No se encontraron resultados.')
        } else {
          setResults(data.Search || [])
        }
      } catch (err) {
        if (!cancelled) {
          setResults([])
          setError(
            err instanceof Error
              ? err.message
              : 'Ocurrió un error al buscar.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, type])

  async function openDetails(movie: Movie) {
    setSelectedMovie(null)
    setDetailsError('')
    setDetailsLoading(true)

    try {
      const params = new URLSearchParams({
        id: movie.imdbID
      })

      const response = await fetch(
        '/api/movies/details?' + params.toString()
      )

      const data: MovieDetails = await response.json()

      if (!response.ok) {
        throw new Error(
          data.Error || 'No se pudo cargar el detalle.'
        )
      }

      setSelectedMovie(data)
    } catch (err) {
      setDetailsError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al cargar el detalle.'
      )
    } finally {
      setDetailsLoading(false)
    }
  }

  const isSearching = query.trim().length >= 2
  const movies = isSearching ? results : featuredMovies

  return (
    <>
      <section className="mb-12 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
        <label
          htmlFor="movie-search"
          className="mb-3 block text-lg font-bold"
        >
          ¿Qué te gustaría ver?
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#171925] px-4">
            <span className="text-xl text-gray-400">⌕</span>

            <input
              id="movie-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Busca Batman, Interstellar, Breaking Bad..."
              className="min-w-0 flex-1 bg-transparent py-4 text-white outline-none placeholder:text-gray-500"
            />
          </div>

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            aria-label="Filtrar por tipo"
            className="rounded-xl border border-white/10 bg-[#171925] px-4 py-3 text-white outline-none focus:border-amber-400"
          >
            <option value="all">Todo</option>
            <option value="movie">Películas</option>
            <option value="series">Series</option>
          </select>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          Los resultados se actualizan mientras escribes,
          sin recargar la página.
        </p>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              {isSearching ? 'Resultados' : 'Selección inicial'}
            </p>

            <h2 className="text-2xl font-bold sm:text-3xl">
              {isSearching
                ? 'Encuentra tu título'
                : 'Películas y series destacadas'}
            </h2>
          </div>

          {!isSearching && (
            <span className="text-sm text-gray-500">
              Catálogo inicial
            </span>
          )}
        </div>

        {loading && (
          <div className="mb-6 flex items-center gap-3 text-amber-300">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
            Buscando títulos...
          </div>
        )}

        {error && !loading && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-red-200"
          >
            {error}
          </div>
        )}

        {!loading && !error && isSearching && movies.length === 0 && (
          <p className="mb-6 text-gray-400">
            No hay resultados para mostrar.
          </p>
        )}

        {!isSearching && movies.length === 0 && (
          <p className="mb-6 text-gray-400">
            No se pudieron cargar los títulos destacados.
            Comprueba tu conexión y la API key.
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-6">
          {movies.map((movie) => (
            <button
              key={movie.imdbID}
              type="button"
              onClick={() => openDetails(movie)}
              className="group overflow-hidden rounded-xl border border-white/10 bg-[#191b27] text-left transition duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-xl hover:shadow-black/20"
            >
              <div className="aspect-[2/3] overflow-hidden bg-[#252737]">
                {movie.Poster && movie.Poster !== 'N/A' ? (
                  <img
                    src={movie.Poster}
                    alt={'Póster de ' + movie.Title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center text-gray-500">
                    <span className="text-3xl">🎬</span>
                    <span className="text-sm">Sin póster</span>
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="line-clamp-2 min-h-10 font-bold text-white group-hover:text-amber-300">
                  {movie.Title}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span>{movie.Year}</span>
                  <span>·</span>
                  <span className="capitalize">{movie.Type}</span>
                </div>

                <p className="mt-3 text-sm font-semibold text-amber-400">
                  Ver detalles →
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {(detailsLoading || selectedMovie || detailsError) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!detailsLoading) {
              setSelectedMovie(null)
              setDetailsError('')
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Detalles de película o serie"
            className="relative my-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-[#171925] p-5 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Cerrar detalles"
              disabled={detailsLoading}
              onClick={() => {
                setSelectedMovie(null)
                setDetailsError('')
              }}
              className="absolute right-4 top-4 rounded-lg px-3 py-2 text-xl text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              ×
            </button>

            {detailsLoading && (
              <div className="py-16 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
                <p className="mt-4 text-gray-300">
                  Cargando información...
                </p>
              </div>
            )}

            {detailsError && !detailsLoading && (
              <div className="py-12 text-center">
                <p className="text-red-300">{detailsError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setDetailsError('')
                    setSelectedMovie(null)
                  }}
                  className="mt-4 rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
                >
                  Cerrar
                </button>
              </div>
            )}

            {selectedMovie && !detailsLoading && (
              <div className="grid gap-6 pt-8 sm:grid-cols-[200px_1fr]">
                <div>
                  {selectedMovie.Poster &&
                  selectedMovie.Poster !== 'N/A' ? (
                    <img
                      src={selectedMovie.Poster}
                      alt={'Póster de ' + selectedMovie.Title}
                      className="mx-auto w-full max-w-[200px] rounded-xl object-cover shadow-lg"
                    />
                  ) : (
                    <div className="flex aspect-[2/3] items-center justify-center rounded-xl bg-white/5 text-gray-500">
                      Sin póster
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                    {selectedMovie.Type}
                  </span>

                  <h2 className="mt-2 text-3xl font-black">
                    {selectedMovie.Title}
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    {selectedMovie.Year}
                    {selectedMovie.Rated &&
                      selectedMovie.Rated !== 'N/A' &&
                      ' · ' + selectedMovie.Rated}
                    {selectedMovie.Runtime &&
                      selectedMovie.Runtime !== 'N/A' &&
                      ' · ' + selectedMovie.Runtime}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedMovie.imdbRating &&
                      selectedMovie.imdbRating !== 'N/A' && (
                        <span className="rounded-lg bg-amber-400/10 px-3 py-2 text-sm font-bold text-amber-300">
                          ★ {selectedMovie.imdbRating}/10 IMDb
                        </span>
                      )}

                    {selectedMovie.Genre &&
                      selectedMovie.Genre !== 'N/A' && (
                        <span className="rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-300">
                          {selectedMovie.Genre}
                        </span>
                      )}
                  </div>

                  <h3 className="mt-6 font-bold">Sinopsis</h3>
                  <p className="mt-2 leading-relaxed text-gray-300">
                    {selectedMovie.Plot &&
                    selectedMovie.Plot !== 'N/A'
                      ? selectedMovie.Plot
                      : 'No hay una sinopsis disponible.'}
                  </p>

                  <div className="mt-5 space-y-3 text-sm">
                    {selectedMovie.Director &&
                      selectedMovie.Director !== 'N/A' && (
                        <p>
                          <span className="text-gray-500">
                            Director:{' '}
                          </span>
                          {selectedMovie.Director}
                        </p>
                      )}

                    {selectedMovie.Actors &&
                      selectedMovie.Actors !== 'N/A' && (
                        <p>
                          <span className="text-gray-500">
                            Reparto:{' '}
                          </span>
                          {selectedMovie.Actors}
                        </p>
                      )}

                    {selectedMovie.Released &&
                      selectedMovie.Released !== 'N/A' && (
                        <p>
                          <span className="text-gray-500">
                            Estreno:{' '}
                          </span>
                          {selectedMovie.Released}
                        </p>
                      )}

                    {selectedMovie.Language &&
                      selectedMovie.Language !== 'N/A' && (
                        <p>
                          <span className="text-gray-500">
                            Idioma:{' '}
                          </span>
                          {selectedMovie.Language}
                        </p>
                      )}

                    {selectedMovie.Awards &&
                      selectedMovie.Awards !== 'N/A' && (
                        <p>
                          <span className="text-gray-500">
                            Premios:{' '}
                          </span>
                          {selectedMovie.Awards}
                        </p>
                      )}
                  </div>

                  <p className="mt-6 text-xs text-gray-500">
                    ID IMDb: {selectedMovie.imdbID}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}