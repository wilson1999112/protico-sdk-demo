import localforage from "localforage";
import { matchSorter } from "match-sorter";
import { LobbyItem } from "protico-sdk";
import sortBy from "sort-by";
import { getProticoClient } from "./api";

export interface DomainData {
  domain: string;
  lobbies: LobbyItem[];
}

export async function getLobbies(domain: string): Promise<LobbyItem[]> {
  let lobbies: LobbyItem[] =
    (await localforage.getItem("lobbies")) ||
    (await getProticoClient().whiteboard.get(domain));
  return lobbies.sort(sortBy("url"));
}

export async function getLobby(id?: string): Promise<LobbyItem | null> {
  if (!id) return null;
  const lobby = (await getProticoClient().whiteboard.getOne(id)) || null;
  return lobby;
}

// fake a cache so we don't slow down stuff we've already seen
let fakeCache: { [key: string]: boolean } = {};

async function fakeNetwork(key?: string): Promise<void> {
  if (key) {
    if (fakeCache[key]) {
      return;
    }

    fakeCache[key] = true;
  } else {
    fakeCache = {};
  }
  return new Promise((res) => {
    setTimeout(res, Math.random() * 800);
  });
}
