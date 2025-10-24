import axios from "axios";
import fs from "fs";

export async function getSchedules({
  UNLocationCode = "TRGEM",
  date = "2025-11-01",
  limit = 10,
} = {}) {
  const url = `${process.env.MAERSK_BASE_URL}/v1/port-schedules?UNLocationCode=${UNLocationCode}&date=${date}&limit=${limit}`;
  console.log("🔗 Fetching from:", url);

  try {
    const res = await axios.get(url, {
      headers: {
        "Consumer-Key": process.env.MAERSK_CONSUMER_KEY,
        Accept: "application/json",
      },
    });

    if (res.data) {
      fs.writeFileSync("lastResponse.json", JSON.stringify(res.data, null, 2));
      console.log("✅ Data fetched successfully");
      return res.data;
    } else {
      throw new Error("Empty response from Maersk API");
    }
  } catch (err) {
    console.error("❌ Error fetching data:", err.response?.status, err.response?.data || err.message);
    return { error: err.response?.data || err.message };
  }
}
