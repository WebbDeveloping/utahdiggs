# Airtable API Documentation

Raw Airtable-generated API export for the **Anna — Seller Portal System** base. Each file is a mechanical slice of the original export — plain text, unmodified format.

**Base ID:** `appNh6k6ZP0c2OtbQ`

The unmodified original (5,736 lines) is preserved at [`_archive/airtable-docs.txt`](_archive/airtable-docs.txt).

## Related project docs

- [`docs/REBUILD-PLAN.md`](../REBUILD-PLAN.md) — human-readable field purpose summary for the Postgres rebuild
- [`scripts/import-airtable.ts`](../../scripts/import-airtable.ts) — table IDs used in the Airtable → Postgres migration script

## Contents

### General

| File | Lines | Description |
|------|-------|-------------|
| [00-overview.txt](00-overview.txt) | 53 | Introduction, metadata, rate limits, authentication |
| [errors.txt](errors.txt) | 22 | HTTP status codes and error responses |

### Tables

| File | Table ID | Lines |
|------|----------|-------|
| [tables/listings.txt](tables/listings.txt) | `tbltohB45hwmmGjE3` | 1,118 |
| [tables/sellers.txt](tables/sellers.txt) | `tblBoQZZbkGpIe5V7` | 453 |
| [tables/weekly-stats.txt](tables/weekly-stats.txt) | `tbl7xNeeU3QOj88ds` | 596 |
| [tables/showings.txt](tables/showings.txt) | `tblgQQizi4zE22L7q` | 434 |
| [tables/market-data.txt](tables/market-data.txt) | `tblY3CYT2e6mkOjey` | 528 |
| [tables/seller-requests.txt](tables/seller-requests.txt) | `tblLccmOrodONrfJs` | 608 |
| [tables/status-queue.txt](tables/status-queue.txt) | `tblKFLbPhdHDfa2lj` | 210 |
| [tables/offers.txt](tables/offers.txt) | `tblrkfPpQYHWoURZf` | 705 |
| [tables/co-seller-access-requests.txt](tables/co-seller-access-requests.txt) | `tblf0VYMryBefkOuG` | 317 |
| [tables/closing-team.txt](tables/closing-team.txt) | `tblLAcvvjwPRcWa7G` | 422 |
| [tables/documents.txt](tables/documents.txt) | `tblx5BL7ocWKXSPdh` | 270 |

Each table file contains: table ID, field definitions (names, IDs, types, examples), and CRUD API reference (list, retrieve, create, update, delete).
