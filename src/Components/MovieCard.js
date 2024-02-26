import React from "react";
import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";
import TrailerPlayer from "./TrailerPlayer";
import { styled } from "@mui/material/styles";

const MovieCardContainer = styled(Card)({
  width: 350,
  height: 550,
  perspective: "1000px",
  margin: "10px",
  "&:hover .movie-card-inner": {
    transform: "rotateY(180deg)",
  },
  marginLeft: 30,
  marginRight: 30,
});

const CardInner = styled(Box)({
  position: "relative",
  width: "100%",
  height: "100%",
  textAlign: "left",
  transition: "transform 0.8s",
  transformStyle: "preserve-3d",
});

const CardFront = styled(Box)({
  position: "absolute",
  width: "100%",
  height: "100%",
  backfaceVisibility: "hidden",
});

const CardBack = styled(Box)({
  position: "absolute",
  width: "100%",
  height: "100%",
  backfaceVisibility: "hidden",
  transform: "rotateY(180deg)",
});

const StyledCardMedia = styled(CardMedia)({
  width: "100%",
  height: "100%",
});

const StyledMovieTitle = styled("h3")(({ theme }) => ({
  color: theme.palette.primary.dark,
  textDecoration: "underline",
  textDecorationColor: theme.palette.primary.dark,
}));

const StyledMovieInfoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.text.secondary,
  paddingTop: "15px",
}));

const MovieCard = ({ item }) => {
  return (
    <MovieCardContainer className="movie-card-container" variant="outlined">
      <CardInner className="movie-card-inner">
        <CardFront>
          <StyledCardMedia
            component="img"
            image={item.image}
            alt={item.title}
          />
        </CardFront>
        <CardBack>
          <CardContent>
            <Typography className="movie-title" gutterBottom component="div">
              <a target="_blank" href={item.url} rel="noreferrer">
                <StyledMovieTitle>
                  {`${item.title} (${item.year})`}
                </StyledMovieTitle>
              </a>
            </Typography>
            <Typography
              className="movie-plot"
              variant="body1"
              color="text.secondary"
            >
              {item.plot}
            </Typography>
            <StyledMovieInfoContainer>
              <Typography
                className="movie-cast"
                variant="body1"
                component="div"
              >
                <span style={{ fontWeight: "bold", fontStyle: "italic" }}>
                  Cast:
                </span>{" "}
                {item.actors}
              </Typography>
            </StyledMovieInfoContainer>
            <StyledMovieInfoContainer>
              <Typography
                className="movie-director"
                variant="body1"
                component="div"
              >
                <span style={{ fontWeight: "bold", fontStyle: "italic" }}>
                  Director:
                </span>{" "}
                {item.directors}
              </Typography>
            </StyledMovieInfoContainer>
            <StyledMovieInfoContainer>
              <Typography
                className="movie-rating"
                variant="body1"
                component="div"
              >
                <span style={{ fontWeight: "bold", fontStyle: "italic" }}>
                  Rating:
                </span>{" "}
                {item.rating}
              </Typography>
            </StyledMovieInfoContainer>
            <TrailerPlayer movie_id={item.id} />
          </CardContent>
        </CardBack>
      </CardInner>
    </MovieCardContainer>
  );
};

export default MovieCard;