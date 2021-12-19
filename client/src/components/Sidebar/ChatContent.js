import React from "react";
import { Box, Typography, Badge } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 20,
    marginRight: 20,
    flexGrow: 1,
  },
  username: {
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  previewText: {
    fontSize: 12,
    color: "#9CADC8",
    letterSpacing: -0.17
  },
  unreadText: {
    color: "#000",
    fontWeight: 600
  }
}));

const ChatContent = (props) => {
  const classes = useStyles();

  const { conversation } = props;
  const { latestMessageText, otherUser, totalUnreads } = conversation;

  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        <Typography className={totalUnreads > 0 ? `${classes.previewText} ${classes.unreadText}` : `${classes.previewText}`}>
          {latestMessageText}
        </Typography>
      </Box>
      {totalUnreads > 0 &&
        <Box>
          <Badge badgeContent={totalUnreads} color="primary" />
        </Box>
      }
    </Box>
  );
};

export default ChatContent;
