import React, { useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { get } from "aws-amplify/api";
import SearchBox from "./SearchBox";
import MovieCard from "./MovieCard";
import { styled } from "@mui/material/styles";

const MoviesGridContainer = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
});

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isinitalPageLoad, setIsinitalPageLoad] = useState(true);

  const fetchData = async (query) => {
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
            query,
          },
        },
      };
      const response = await get(params).response;
      return response.body.json();
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      setIsError(true);
      return [];
    }
  };

  const handleSubmit = async () => {
    setIsinitalPageLoad(false);
    setIsLoading(true);
    const response = await fetchData(search);
    console.log(response);
    if (response !== null && response.total.value > 0) {
      const results = response["hits"];
      setData(
        results.map((item) => {
          return {
            url: "https://www.imdb.com/title/" + item._id,
            image: item._source.image_url,
            title: item._source.title,
            plot: item._source.plot,
            rating: item._source.rating,
            year: item._source.year,
            actors: item._source.actors.join(","),
            directors: item._source.directors.join(","),
            id: item._id,
          };
        })
      );
    } else {
      setData([]);
    }
    setIsLoading(false);
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
        <MoviesGridContainer className="search-results">
          {data.map((item) => (
            <MovieCard key={item.id} item={item} />
          ))}
        </MoviesGridContainer>
      )}
    </div>
  );
};

export default SearchBar;