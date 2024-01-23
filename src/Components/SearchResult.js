import React from 'react';
import MovieCard from './MovieCard';

const SearchResults = ({ data }) => {
  return (
    <div className="search-results">
      {data.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default SearchResults;
