import type { Movie } from '../types/movie';

export const SAMPLE_MOVIES: Movie[] = [
  {
    id: 'm-1',
    title: 'Inception',
    year: 2010,
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    genre: ['Sci-Fi', 'Action'],
    rating: 8.8,
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.'
  },
  {
    id: 'm-2',
    title: 'Interstellar',
    year: 2014,
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    rating: 8.7,
    overview: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers.'
  },
  {
    id: 'm-3',
    title: 'The Dark Knight',
    year: 2008,
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    genre: ['Action', 'Crime', 'Drama'],
    rating: 9.0,
    overview: 'When the menace known as the Joker wreaks havoc and chaos on Gotham City, Batman must accept one of the greatest psychological and physical tests.'
  },
  {
    id: 'm-4',
    title: 'Spirited Away',
    year: 2001,
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    genre: ['Animation', 'Adventure', 'Family'],
    rating: 8.6,
    overview: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.'
  },
  {
    id: 'm-5',
    title: 'Spider-Man: Into the Spider-Verse',
    year: 2018,
    posterUrl: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=600&q=80',
    genre: ['Animation', 'Action', 'Adventure'],
    rating: 8.4,
    overview: 'Teen Miles Morales becomes the new Spider-Man and joins other Spider-Heroes from various dimensions to stop a threat to all reality.'
  },
  {
    id: 'm-6',
    title: 'Dune: Part Two',
    year: 2024,
    posterUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    rating: 8.5,
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.'
  },
  {
    id: 'm-7',
    title: 'Parasite',
    year: 2019,
    posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
    genre: ['Drama', 'Thriller'],
    rating: 8.5,
    overview: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.'
  },
  {
    id: 'm-8',
    title: 'La La Land',
    year: 2016,
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    genre: ['Comedy', 'Drama', 'Music'],
    rating: 8.0,
    overview: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.'
  }
];
