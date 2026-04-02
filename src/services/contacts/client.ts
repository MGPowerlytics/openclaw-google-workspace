/**
 * Google Contacts (People API) client wrapper.
 */

import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

export interface Contact {
  resourceName?: string;
  displayName?: string;
  emails?: Array<{ value: string }>;
  phones?: Array<{ value: string }>;
  organizations?: Array<{ name?: string; title?: string }>;
}

export interface ContactsClient {
  searchContacts(query: string, maxResults: number): Promise<Contact[]>;
  getContact(resourceName: string): Promise<Contact>;
}

const PERSON_FIELDS = "names,emailAddresses,phoneNumbers,organizations";

function toContact(person: Record<string, unknown>): Contact {
  const p = person as {
    resourceName?: string;
    names?: Array<{ displayName?: string }>;
    emailAddresses?: Array<{ value?: string }>;
    phoneNumbers?: Array<{ value?: string }>;
    organizations?: Array<{ name?: string; title?: string }>;
  };

  return {
    resourceName: p.resourceName ?? undefined,
    displayName: p.names?.[0]?.displayName ?? undefined,
    emails: p.emailAddresses
      ?.filter((e) => e.value)
      .map((e) => ({ value: e.value! })),
    phones: p.phoneNumbers
      ?.filter((ph) => ph.value)
      .map((ph) => ({ value: ph.value! })),
    organizations: p.organizations?.map((o) => ({
      name: o.name ?? undefined,
      title: o.title ?? undefined,
    })),
  };
}

export function createContactsClient(auth: OAuth2Client): ContactsClient {
  const people = google.people({ version: "v1", auth });

  return {
    async searchContacts(query, maxResults) {
      const res = await people.people.searchContacts({
        query,
        pageSize: maxResults,
        readMask: PERSON_FIELDS,
      });

      const results = res.data.results ?? [];
      return results
        .filter((r) => r.person)
        .map((r) => toContact(r.person as Record<string, unknown>));
    },

    async getContact(resourceName) {
      const res = await people.people.get({
        resourceName,
        personFields: PERSON_FIELDS,
      });
      return toContact(res.data as Record<string, unknown>);
    },
  };
}
