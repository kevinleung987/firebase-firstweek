import {
  Grid,
  Avatar,
  Button,
  Input,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import React from "react";
import { useDatabase, useDatabaseList, useUser } from "reactfire";
import { currentBoard } from "./../utils/firebaseUtils";
import Presence from './Presence';

const useStyles = makeStyles((theme) => ({
  chat: {
    height: "60vh",
    overflow: "auto",
  },
  sendMessage: { marginTop: 16, padding: 8 },
}));

export default function Chat() {
  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage(event.target.value);
    }
  };

  const sendMessage = (message) => {
    messagesRef.push({
      content: message,
      timestamp: Date.now(),
      author: user.displayName,
    });
    setMessage("");
  };

  const classes = useStyles();
  const messagesBottomRef = React.useRef();
  const user = useUser();
  const db = useDatabase();
  const messagesRef = db.ref(`boards/${currentBoard()}/messages`);
  const messageChanges = useDatabaseList(messagesRef);
  const [message, setMessage] = React.useState("");
  React.useEffect(
    () => messagesBottomRef.current.scrollIntoView({ behavior: "smooth" }),
    [messageChanges]
  );

  return (
    <div>
      <Presence />
      <Paper className={classes.chat} elevation={3}>
        <List>
          {messageChanges.map(({ snapshot }) => {
            const { content, timestamp, author } = snapshot.val();
            const date = new Date(timestamp).toLocaleTimeString();

            return (
              <ListItem key={snapshot.key}>
                <ListItemAvatar>
                  <Avatar>
                    <AccountCircleIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primaryTypographyProps={{ noWrap: true }}
                  primary={content}
                  secondary={`Sent by ${author} at ${date}`}
                />
              </ListItem>
            );
          })}
          <div ref={messagesBottomRef} />
        </List>
      </Paper>
      <Paper className={classes.sendMessage}>
        <Grid container>
          <Grid item xs={10}>
            <Input
              placeholder="Send a Message"
              fullWidth
              value={message}
              onKeyDown={handleKeyPress}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              color="primary"
              disabled={message.length === 0}
              onClick={() => sendMessage(message)}
            >
              Send
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
