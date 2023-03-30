import QuestionBox from "@/components/QuestionBox";
import styles from "@/styles/Home.module.css";
import {
  Box,
  Button,
  Center,
  Flex,
  Paper,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { Inter } from "next/font/google";
import Head from "next/head";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>Chat</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex
        h="100vh"
        gap="md"
        align="center"
        direction="column"
        wrap="nowrap"
        pt="xl"
      >
        <QuestionBox />
      </Flex>
    </>
  );
}
