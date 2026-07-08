export type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

type AirtableResponse = {
  records: AirtableRecord[];
  offset?: string;
};

export async function fetchAllAirtableRecords(
  tableName: string,
): Promise<AirtableRecord[]> {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_API_KEY;

  if (!baseId) {
    throw new Error("AIRTABLE_BASE_ID is required");
  }
  if (!token) {
    throw new Error("AIRTABLE_API_KEY is required");
  }

  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
    );
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `Airtable fetch failed (${tableName}): ${res.status} ${body}`,
      );
    }

    const data = (await res.json()) as AirtableResponse;
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  return records;
}
