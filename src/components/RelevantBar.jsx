import {
  Code,
  Divider,
  Overlay,
  Paper,
  Stack,
  Title,
  createStyles,
} from "@mantine/core";

const useStyles = createStyles((theme, { disabled }) => ({
  box: {
    position: "relative",
  },
  title: {
    color: disabled ? theme.colors.gray[5] : theme.colors.teal[6],
  },
}));

function RelevantBar({ disabled, relevantData }) {
  const { classes } = useStyles({ disabled });
  return (
    <>
      <Paper
        shadow={disabled ? "xs" : "sm"}
        className={classes.box}
        radius="md"
        p="xl"
        withBorder
        h="100%"
      >
        <Title
          mb="lg"
          className={classes.title}
          color={disabled ? "gray" : "#20c997"}
          order={4}
        >
          DATOS RELEVANTES
        </Title>
        <Stack gap="md">
          {relevantData?.map((value, index) => (
            <Paper p="xs" shadow="md" withBorder key={index}>
              {value}
            </Paper>
          ))}
          {disabled ? (
            <Code style={{ color: "white" }}>
              <p>
                Para ver los datos relevantes, primero debes hacer una pregunta.
              </p>
            </Code>
          ) : null}
        </Stack>
      </Paper>
    </>
  );
}

export default RelevantBar;
