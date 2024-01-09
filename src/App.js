import '@aws-amplify/ui-react/styles.css';
// import 'react-modal-video/scss/modal-video.scss'
import {
  Authenticator,
  Button
} from '@aws-amplify/ui-react';
import './App.css';
import { Amplify } from "aws-amplify";
import { get } from 'aws-amplify/api'
import { fetchAuthSession } from 'aws-amplify/auth'
import awsconfig from './aws-exports';
import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { getUrl } from 'aws-amplify/storage';
import Modal from '@mui/material/Modal';
import { green } from '@mui/material/colors';

Amplify.configure(awsconfig);

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  // border: '2px solid #000',
  boxShadow: 24
};


const BasicModal = (movie_id) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [data, updateData] = useState();
  useEffect(() => {
    let key = 'Default.mp4';
    if (["tt1981115", "tt0800369", "tt0172495"].includes(movie_id.movie_id) === true) {
      key = `${movie_id.movie_id}.mp4`;
    }
    const getData = async () => {
      const resp = await getUrl({
        key,
        options: {
          validateObjectExistence: true,
          accessLevel: 'public',
        }
      });
      updateData(resp.url);
    }
    getData();
  }, [movie_id.movie_id]);

  // console.log(data);

  return (
    <div class="trailer">
       <Button
              variation='link' 
              onClick={handleOpen}
            >Watch Trailer</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <video autoPlay={true} id="vid1" className="video-player">
            <source src={data} />
          </video>
        </Box>
      </Modal>
    </div>
  );
}


function App({ signOut }) {
  let [search, setSearch] = useState('');
  let [isError, setIsError] = useState(false);
  let [data, setData] = useState([])
  let [isLoading, setIsLoading] = useState(false)
  let [isinitalPageLoad, setIsinitalPageLoad] = useState(true)

  const fetchData = async (query) => {
    try {
      const idToken = (await fetchAuthSession()).tokens?.idToken?.toString();
      const params = {
        apiName: 'moviesearchapi',
        path: '/items',
        options: {
          headers: {
            Authorization: idToken,
          },
          queryParams: {
            query,
          },
        }
      }
      const response = await get(params).response;
      return response.body.json();
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      setIsError(true)
      return [];
    }
  };

  const handleSubmit = async () => {
    setIsinitalPageLoad(false);
    setIsLoading(true);
    const response = await fetchData(search);
    if (response !== null && response.total.value > 0) {
      const results = response['hits'];
      setData(results.map(item => {
        return {
          url: 'https://www.imdb.com/title/' + item._id,
          image: item._source.image_url,
          title: item._source.title,
          plot: item._source.plot,
          year: item._source.year,
          actors: item._source.actors.join(","),
          directors: item._source.directors.join(","),
          id: item._id
        }
      }));
    } else {
      setData([])
    }
    setIsLoading(false);
  };

  return (
    <Authenticator key="auth">
      {({ signOut, user }) => (
        <div className="App">
          <Box className='signout' sx={{ alignItems: 'end', textAlign: 'right' }}>
            <Button
              variation='link'
              size="large"
              onClick={signOut}
            >Sign Out</Button>
          </Box>
          <div className="App-header">
            <h1>Movie Search</h1>
            <Box sx={{ display: "flex", alignItems: 'end', textAlign: 'right' }}>
              <TextField sx={{ marginBottom: -1, marginRight: 6, fieldset: {borderColor: "white"}, label: { color: 'white', fontWeight: 'bold' },  input: { color: 'white', fontWeight: 'bold' } }} id="outlined-search" label="Search" type="search" value={search} onChange={e => setSearch(e.target.value)} />
              <Button variation='primary' disabled={isLoading} onClick={handleSubmit}>
                {isLoading ? "Loading..." : "Search"}
              </Button>
            </Box>
            <Box sx={{ display: "flex", alignItems: 'center', label: { fontSize: 14, fontWeight: 'bold' }, textAlign: 'right', minHeight: 55 }}>
              {isLoading && <label>Getting results...</label>}
              {isError && <label>Error while getting results</label>}
              {!isinitalPageLoad && !isError && !isLoading && data.length === 0 && <label key="noRecords">No results. Try another search term.</label>}
            </Box>
          </div>

          {data.length > 0 && (
            <div class="search-results">
              {data.map((item) =>
                <div key={item.id} class="movies-container">
                  <Card variant="outlined" sx={{ display: 'flex' }}>
                    {/* <CardActionArea> */}
                    <CardMedia
                      component="img"
                      sx={{ width: 150 }}
                      href={item.url}
                      image={item.image}
                      alt={item.title}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ padding: 4, flex: '1 0 auto' }}>
                        <Typography gutterBottom variant="h5" component="div">
                          <a target="_blank" href={item.url} rel="noreferrer">{item.title}</a>  ({item.year})
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {item.plot}
                        </Typography>
                        <Typography gutterBottom variant="h6" component="div">
                          Cast:
                          <Typography variant="body1" color="text.secondary">
                            {item.actors}
                          </Typography>
                        </Typography>
                        <BasicModal movie_id={item.id} />
                        {/* <Player id={item._id} /> */}
                        {/* <Button
                          variation='link'
                          size="large"
                          onClick={VideoPlayer}
                        >Watch Trailer</Button> */}
                      </CardContent>
                    </Box>
                    {/* </CardActionArea> */}
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Authenticator>
  );
}

export default App;
