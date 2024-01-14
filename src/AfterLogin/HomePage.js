import {
  Card,
  CardMedia,
  Button,
  Menu,
  MenuList,
  MenuItem,
} from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import "./Study.css";
import ErrorPage from "../ErrorPage";
import DBHandler from "../Controller/DBHandler";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function HomePage() {
  const [user] = useOutletContext();
  const [userDecks, setUserDecks] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedID, setSelectedID] = useState();
  const navigate = useNavigate();
  const dbHandler = useMemo(
    () => new DBHandler(user.uid, setErrorMessage),
    [user.uid, setErrorMessage]
  );

  useEffect(() => {
    const takeDecksAndIDsInfo = async () => {
      try {
        const { userDecks } = await dbHandler.getUserAndDecksInfo(false);
        setUserDecks(userDecks);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };
    takeDecksAndIDsInfo();
  }, [dbHandler]);

  const handleClick = (deckID) => {
    navigate(`/study/${deckID}`);
  };

  const handleEdit = () => {
    navigate(`/editDeck/${selectedID}`);
  };

  const handleDelete = async (deckID) => {
    try {
      const newUserDeck = await dbHandler.deleteUserDeck(deckID);
      setUserDecks(newUserDeck);
      setSelectedID(null);
      setAnchorEl(null);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleMenu = (event, deckID) => {
    setSelectedID(deckID);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAdd = () => {
    navigate("/addDeck");
  };

  const addDeckCardForm = (
    <Card
      key="new-deck"
      style={{ marginBottom: "10px" }}
      className="homepage-add-deck-card-form"
      variant="outlined"
      onClick={() => handleAdd()}
    >
      <div>
        <h4>+ New deck</h4>
      </div>
    </Card>
  );

  //component show the decks option
  const deckList =
    userDecks.length &&
    userDecks.map((deck) => {
      const deckName = deck.deckName;
      const cardsNum = deck.deckCards.length;
      const deckID = deck.deckID;
      return (
        <Card
          key={deckID}
          style={{ marginBottom: "10px" }}
          className="homepage-deck"
        >
          <div className="homepage-card-header">
            {<MoreVertIcon onClick={(event) => handleMenu(event, deckID)} />}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                horizontal: "right",
                vertical: "bottom",
              }}
              transformOrigin={{
                horizontal: "right",
                vertical: "bottom",
              }}
              PaperProps={{ elevation: 1 }}
            >
              <MenuList dense>
                <MenuItem value={deckID} onClick={(e) => handleEdit(e.value)}>
                  <ListItemIcon>
                    <ModeEditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleDelete(selectedID)}>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Delete</ListItemText>
                </MenuItem>
              </MenuList>
            </Menu>
          </div>
          <div
            className="homepage-card-body"
            onClick={() => handleClick(deckID)}
          >
            <h4>{deckName}</h4>
            <p>{cardsNum} cards</p>
          </div>
        </Card>
      );
    });

  const allCards = userDecks.length ? [...deckList, addDeckCardForm] : null;

  const emptyCard = (
    <div className="homepage-empty-deck" onClick={() => handleAdd()}>
      <img className="homepage-empty-deck-image" src="Home.png" />{" "}
      <h4>+ New deck</h4>
    </div>
  );

  return (
    <div>
      <ErrorPage
        errorMessage={errorMessage}
        handleErrorMessage={() => setErrorMessage("")}
      />
      <div className="homepage-welcome">
        {/* <h5>
          👋 Welcome back, {user.displayName ? user.displayName : "Student"}.
        </h5> */}
        <br />
        <h3>🗂️Decks</h3>
        <br />
      </div>
      <div className="homepage-layout">{allCards}</div>
      {!allCards && emptyCard}
    </div>
  );
}
