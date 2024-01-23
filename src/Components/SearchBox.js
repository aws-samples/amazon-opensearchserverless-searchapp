import React from "react";
import { Box, TextField, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

const SearchContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  textAlign: "right",
  justifyContent: "center",
  color: theme.palette.primary.light,
  padding: theme.spacing(2),
}));

const StyledTitle = styled("h1")(({ theme }) => ({
  color: theme.palette.primary.main,
  textAlign: "center",
  fontWeight: "600",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  fontStyle: "italic",
  marginRight: 20,
  width: "100%",
  maxWidth: 600,
  minWidth: 100,
  height: 45,
  fieldset: {
    borderColor: theme.palette.primary.light,
    borderRadius: "20px",
  },
  label: { color: theme.palette.primary.light, fontWeight: "bold" },
  input: { color: theme.palette.primary.light, fontWeight: "bold" },
}));

const StyledBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  label: { fontSize: 14, fontWeight: "bold" },
  textAlign: "right",
  justifyContent: "center",
  minHeight: 55,
  color: theme.palette.primary.light,
}));

const SearchBox = ({ search, isLoading, isError, setSearch, handleSubmit }) => {
  return (
    <div className="search-container">
      <StyledTitle>Movie Finder</StyledTitle>
      <SearchContainer>
        <StyledTextField
          id="outlined-search"
          label="Type in something..."
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          className="search-button"
          variation="primary"
          disabled={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? "Loading..." : "Search"}
        </Button>
      </SearchContainer>
      <StyledBox>
        {isLoading && <label>Getting results...</label>}
        {isError && <label>Error while getting results</label>}
      </StyledBox>
    </div>
  );
};

export default SearchBox;