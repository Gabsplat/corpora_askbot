import { getSheetsData } from "@/server/utils";

export default async function handler(req, res) {
  const data = await getSheetsData();
  console.log("Getting data...");
  res.status(200).json(data);
}
