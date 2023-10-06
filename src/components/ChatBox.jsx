import {
  Avatar,
  Box,
  Flex,
  Group,
  Paper,
  Skeleton,
  Text,
  TextInput,
  Title,
  createStyles,
} from "@mantine/core";
import { IconUserCircle } from "@tabler/icons-react";
import { useRef, useState } from "react";

const useStyles = createStyles((theme) => ({
  box: {
    position: "sticky",
    width: "100%",
    top: "50%",
    // transform: "translateY(-50%)",
  },
  title: {
    color: theme.colors.teal[6],
  },
  chatBox: {
    paddingBottom: "1rem",
  },
}));

function ChatBox({ fetchAnswer, answer }) {
  const { classes } = useStyles();
  const inputRef = useRef(null);

  const [isLoading, setLoading] = useState(true);
  const [userQuestion, setUserQuestion] = useState(null);

  const submitQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    const question = inputRef.current.value;
    inputRef.current.value = "";
    if (question) {
      setUserQuestion(question);
      await fetchAnswer(question);
      setLoading(false);
    }
  };

  return (
    <Paper className={classes.box} shadow="md" radius="md" p="xl" withBorder>
      <Title className={classes.title} mb="md" order={4}>
        PREGUNTA
      </Title>
      <Box className={classes.chatBox}>
        <Group>
          <Avatar src="/images/logo.png" color="blue" radius="xl" />
          <Text>¡Hola! ¿En qué puedo ayudarte?</Text>
        </Group>
        {userQuestion ? (
          <Group mt="md" spacing="sm" position="right">
            <Flex justify="end" w="80%">
              <Text align="left">{userQuestion}</Text>
            </Flex>
            <Avatar m={0} color="blue" radius="xl">
              <IconUserCircle size="1.5rem" />
            </Avatar>
          </Group>
        ) : null}
        {userQuestion ? (
          <Group mt="md" position="left" spacing="sm">
            <Avatar src="/images/logo.png" color="blue" radius="xl" />
            <Skeleton w="80%" mih="20px" visible={isLoading}>
              <Text>{answer}</Text>
            </Skeleton>
          </Group>
        ) : null}
      </Box>
      <form onSubmit={submitQuestion}>
        <TextInput ref={inputRef} placeholder="Preguntale algo al bot..." />
      </form>
    </Paper>
  );
}

export default ChatBox;
