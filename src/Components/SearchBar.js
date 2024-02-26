import React, { useState, useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { get } from "aws-amplify/api";
import SearchBox from "./SearchBox";
import MovieCard from "./MovieCard";
import { styled } from "@mui/material/styles";
import { Select, MenuItem, FormControl } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import SwapVertIcon from "@mui/icons-material/SwapVert";

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

const SortingContainer = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  paddingRight: "150px",
  paddingBottom: "50px",
  color: theme.palette.primary.light,
}));

const SortingSelector = styled(Select)(({ theme }) => ({
  textAlign: "center",
  color: theme.palette.primary.dark,
  backgroundColor: "white",
  "& .MuiSelect-select": {
    paddingRight: 24,
  },
}));

const ErrorMessageContainer = styled("div")(({ theme }) => ({
  textAlign: "center",
  color: theme.palette.primary.light,
}));

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [fetchTrigger, setFetchTrigger] = useState(false);
  const [sortOption, setSortOption] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchAttempted, setSearchAttempted] = useState(false);
  const pageSize = 3;

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
              sortOption: sortOption,
              sortOrder: sortOrder,
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
  }, [search, currentPage, pageSize, fetchTrigger, sortOption, sortOrder]);

  const handleSubmit = () => {
    setCurrentPage(1);
    setFetchTrigger(true);
    setSortOption("");
    setSortOrder("asc");
    setSearchAttempted(true);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    setFetchTrigger(true);
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
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
      {data.length === 0 && !isError && searchAttempted && !isLoading && (
        <ErrorMessageContainer>
          No results found. Please try another search term.
        </ErrorMessageContainer>
      )}
      {data.length > 0 && (
        <div>
          <SortingContainer>
            Sort by
            <FormControl
              variant="standard"
              sx={{ marginLeft: 2, marginRight: 2, minWidth: 120 }}
            >
              <SortingSelector
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setSortOrder("asc");
                }}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
              >
                <MenuItem value="year">Year</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
              </SortingSelector>
            </FormControl>
            <SwapVertIcon
              onClick={toggleSortOrder}
              style={{ cursor: "pointer" }}
            />
          </SortingContainer>
          <MoviesGridContainer>
            {data.map((item) => (
              <MovieCard key={item.id} item={item} />
            ))}
          </MoviesGridContainer>
        </div>
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