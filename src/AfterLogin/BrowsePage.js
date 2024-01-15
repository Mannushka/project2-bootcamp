import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Card, Button, TextField } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import "./Study.css";
import ErrorPage from "../ErrorPage";
import DBHandler from "../Controller/DBHandler";
import axios from "axios";

export default function BrowsePage() {
  const [user] = useOutletContext();
  const [deckName, setDeckName] = useState("");
  const [deck, setDecks] = useState({});
  const [cards, setCards] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [goHome, setGoHome] = useState(false);
  const navigate = useNavigate();
  const { deckID } = useParams();
  const dbHandler = useMemo(
    () => new DBHandler(user.uid, setErrorMessage, setGoHome),
    [user.uid, setErrorMessage, setGoHome]
  );

  const handleErrorMessage = () => {
    setErrorMessage("");
    if (goHome) {
      navigate("/");
    }
  };

  const handleStudy = () => {
    navigate(`/study/${deckID}`);
  };

  useEffect(() => {
    const getDeckInfo = async () => {
      try {
        await dbHandler.checkUserDeckID(deckID, true);
        const { deckInfo, cardsInfo } = await dbHandler.getDeckAndCards(
          deckID,
          true
        );
        setDeckName(deckInfo.deckName);
        setDecks(deckInfo);
        setCards(cardsInfo);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };
    const genDeckInfo = async () => {
      try {
        const genCardID = await axios.get(
          "https://www.uuidgenerator.net/api/version7"
        );
        const newCardID = genCardID.data;
        setCards([{ cardID: newCardID, english: "", spanish: "" }]);
        setDecks({ deckName: "", deckCards: [newCardID] });
      } catch (error) {
        setErrorMessage(error.message);
      }
    };
    if (deckID) {
      getDeckInfo();
    } else {
      genDeckInfo();
    }
  }, [deckID, dbHandler]);

  const style = {
    py: 0,
    width: "100%",
    borderRadius: 2,
    borderColor: "divider",
    backgroundColor: "background.paper",
  };

  const cardsDisplay = cards.length
    ? cards.map((card, index) => {
        return (
          <Card className="browse-card">
            <div className="browse-card-number">
              <p>{index + 1}</p>
            </div>
            <div className="browse-card-texts">
              <List sx={style}>
                <ListItem>
                  <ListItemText primary={card.english} />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText primary={card.spanish} />
                </ListItem>
              </List>
            </div>
          </Card>
        );
      })
    : null;

  return (
    <div>
      <ErrorPage
        errorMessage={errorMessage}
        handleErrorMessage={handleErrorMessage}
      />
      <div className="browse-card-layout">
        <h2>{deck.deckName}</h2>
      </div>
      <div>
        <Button
          fullWidth
          className="browse-flashcard-button"
          size="large"
          variant="contained"
          onClick={() => handleStudy()}
        >
          👩🏻‍💻Study Flashcard 💡
        </Button>
      </div>
      {<div>{cardsDisplay}</div>}
    </div>
  );
}