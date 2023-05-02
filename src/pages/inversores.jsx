import ChatBox from "@/components/ChatBox";
import QuestionBox from "@/components/QuestionBox";
import RelevantBar from "@/components/RelevantBar";
import { Container, Title, createStyles } from "@mantine/core";
import { useState } from "react";

const useStyles = createStyles((theme) => ({
  bot: {
    display: "flex",
    flexDirection: "row",
    position: "relative",
    gap: "1em",
    height: "100%",
    width: "100%",
    boxSizing: "border-box",
    minHeight: "calc(100vh - 8em)",
  },
  container: {
    height: "100%",
  },
  title: {
    position: "fixed",
  },
}));

function Inversores() {
  const { classes } = useStyles();

  const [isLoading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [relevantData, setRelevantData] = useState([]);

  const fetchAnswer = async (question) => {
    await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAnswer(data.botResponse.split("\n"));
        setRelevantData(data.vectors);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className={classes.bot}>
      <Title className={classes.title} order={1}>
        Inversores
      </Title>
      <div style={{ flex: 1 }}>
        <ChatBox answer={answer} fetchAnswer={fetchAnswer} />
      </div>
      <div
        style={{
          width: "30vw",
        }}
      >
        <RelevantBar
          relevantData={relevantData}
          disabled={relevantData.length < 1}
        />
      </div>
    </div>
  );
}

export default Inversores;
