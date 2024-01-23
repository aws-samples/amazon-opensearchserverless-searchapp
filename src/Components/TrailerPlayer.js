import React, { useState, useEffect } from "react";
import { Modal, Box, Button } from "@mui/material";
import { getUrl } from "aws-amplify/storage";
import { styled } from "@mui/material/styles";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const WatchTrailerButton = styled(Button)(({ theme }) => ({
  fontWeight: "bold",
  alignItems: "left",
  color: theme.palette.text.primary,
  padding: "0",
  "&:hover": {
    backgroundColor: "transparent",
  },
}));

const TrailerPlayer = (movie_id) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [data, updateData] = useState();

  useEffect(() => {
    let key = "Default.mp4";
    if (
      ["tt1981115", "tt0800369", "tt0172495"].includes(movie_id.movie_id) ===
      true
    ) {
      key = `${movie_id.movie_id}.mp4`;
    }
    const getData = async () => {
      const resp = await getUrl({
        key,
        options: {
          validateObjectExistence: true,
          accessLevel: "public",
        },
      });
      updateData(resp.url);
    };
    getData();
  }, [movie_id.movie_id]);

  return (
    <div class="trailer">
      <WatchTrailerButton variation="link" onClick={handleOpen}>
        <h3>Watch Trailer</h3>
        <PlayArrowIcon />
      </WatchTrailerButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx className="video-player-container">
          <video autoPlay={true} id="vid1" className="video-player">
            <source src={data} />
          </video>
        </Box>
      </Modal>
    </div>
  );
};

export default TrailerPlayer;
