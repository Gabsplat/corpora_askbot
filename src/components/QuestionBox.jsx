import {
  Box,
  Button,
  Divider,
  Group,
  Loader,
  Paper,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { Robot } from "@tabler/icons-react";
import React, { useRef, useState } from "react";
import HelpMenu from "./HelpMenu";
import RoundedLogo from "./RoundedLogo";

export default function QuestionBox() {
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [question, setQuestion] = useState("");
  const [askedQuestion, setAskedQuestion] = useState(false);
  const [botAssistantResponse, setBotAssistantResponse] = useState(null);
  const [botVectors, setBotVectors] = useState(null);
  const inputRef = useRef(null);

  const sendQuestion = () => {
    setLoadingQuestion(true);
    // call api from the same next project
    fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: inputRef.current.value,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setBotAssistantResponse(data.botResponse.split("\n"));
        setBotVectors(data.vectors);
        setAskedQuestion(true);
        setQuestion(inputRef.current.value);
        setLoadingQuestion(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Box w="40%">
      <RoundedLogo />
      <Paper
        mt="md"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
        shadow="xl"
        w="100%"
        p="md"
        withBorder
      >
        <Group position="apart" mb="md">
          <Text fs="md" fw="bold">
            Pregunta
          </Text>
          <HelpMenu />
        </Group>
        <Textarea variant="filled" ref={inputRef} />
        <Button
          onClick={() => {
            sendQuestion();
          }}
          leftIcon={<Robot size={20} strokeWidth={2} />}
          mt="sm"
          variant="outline"
          color="teal"
          style={{
            alignSelf: "flex-end",
          }}
        >
          Preguntar
        </Button>
      </Paper>
      <Paper
        style={{
          display: "flex",
          flexDirection: "column",
        }}
        mt="md"
        mb="md"
        shadow="xl"
        w="100%"
        p="md"
        withBorder
      >
        <Box>
          <Text weight="bold">Respuesta</Text>
        </Box>
        {loadingQuestion ? (
          <Loader
            style={{ alignSelf: "center" }}
            mt="md"
            size="sm"
            color="grape"
            variant="bars"
          />
        ) : null}
        {!loadingQuestion && askedQuestion ? (
          <Box
            mt="sm"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <Box style={{ width: "60px" }}>
              <Robot
                size={120}
                height="100%"
                strokeWidth={1}
                width="100%"
                color="#20c997"
                style={{ marginRight: "10px" }}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              {question.length > 0 ? <Title order={4}>{question}</Title> : null}
              {botAssistantResponse.length > 0 &&
                botAssistantResponse.map((value, index) => (
                  <Text key={index}>{value}</Text>
                ))}
            </Box>
          </Box>
        ) : null}
        {!loadingQuestion && askedQuestion ? (
          <>
            <Divider my="sm" variant="dashed" />
            <Box mt="sm">
              <Text weight="bold">Datos relevantes</Text>
              <Box
                mt="sm"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {botVectors.map((value, index) => (
                  <Box
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {value}
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        ) : null}
      </Paper>
    </Box>
  );
}
