import React, { useState, useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { get } from "aws-amplify/api";
import SearchBox from "./SearchBox";
import MovieCard from "./MovieCard";
import { styled } from "@mui/material/styles";
import Pagination from "@mui/material/Pagination";

const MoviesGridContainer = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
});

const PaginationContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  paddingBottom: "60px",
  paddingTop: "30px",
});

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [fetchTrigger, setFetchTrigger] = useState(false);
  const pageSize = 6;

  useEffect(() => {
    const fetchData = async () => {
      if (!search.trim() || !fetchTrigger) return;

      setIsLoading(true);
      setIsError(false);

      try {
        const idToken = (await fetchAuthSession()).tokens?.idToken?.toString();
        const params = {
          apiName: "moviesearchapi",
          path: "/items",
          options: {
            headers: {
              Authorization: idToken,
            },
            queryParams: {
              query: search,
              from: (currentPage - 1) * pageSize,
              size: pageSize,
            },
          },
        };
        const response = await get(params).response;
        const responseBody = await response.body.json();

        if (responseBody && responseBody.total.value > 0) {
          setTotalPages(Math.ceil(responseBody.total.value / pageSize));
          setData(
            responseBody.hits.map((item) => ({
              url: `https://www.imdb.com/title/${item._id}`,
              image: item._source.image_url,
              title: item._source.title,
              plot: item._source.plot,
              rating: item._source.rating,
              year: item._source.year,
              actors: item._source.actors.join(","),
              directors: item._source.directors.join(","),
              id: item._id,
            }))
          );
        } else {
          setData([]);
          setTotalPages(0);
        }
      } catch (error) {
        console.error(error);
        setIsError(true);
        setData([]);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
        setFetchTrigger(false);
      }
    };

    fetchData();
  }, [search, currentPage, pageSize, fetchTrigger]);

  const handleSubmit = () => {
    setCurrentPage(1);
    setFetchTrigger(true);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    setFetchTrigger(true);
  };

  return (
    <div>
      <SearchBox
        search={search}
        isLoading={isLoading}
        isError={isError}
        setSearch={setSearch}
        handleSubmit={handleSubmit}
      />
      {data.length > 0 && (
        <MoviesGridContainer>
          {data.map((item) => (
            <MovieCard key={item.id} item={item} />
          ))}
        </MoviesGridContainer>
      )}
      {data.length > 0 && totalPages > 1 && (
        <PaginationContainer>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="secondary"
          />
        </PaginationContainer>
      )}
    </div>
  );
};

export default SearchBar;