export const hashCode = (url: string) => {
  let hash = 0;
  let i;
  let chr;
  if (url.length === 0) return "0" + hash;
  for (i = 0; i < url.length; i++) {
    chr = url.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return "0" + hash;
};

export const parseUrl = (url: string) => {
  let URLSrc = "";
  if (url.includes("https://www.youtube.com/watch")) {
    URLSrc = "YouTube";
  }

  switch (URLSrc) {
    case "YouTube":
      const readURL = new URL(url);
      const videoID = readURL.searchParams.get("v");
      url = `https://www.youtube.com/watch?v=${videoID}`;
      break;

    default:
      url = url.split(/[?#]/)[0];
      break;
  }

  return url;
};
const assetUrlCode = "::protico===assetUrl===protico::";
const listDataCode = "::protico===listData===protico::";
const urlRegex =
  /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
export const isAssetUrl = (url: string) =>
  url?.includes(assetUrlCode) &&
  !url?.includes(listDataCode) &&
  urlRegex.test(url);
export const isListUrl = (url: string) =>
  url?.includes(assetUrlCode) &&
  url?.includes(listDataCode) &&
  urlRegex.test(url);
export const decodeAssetUrl = (url: string) => {
  url = url.replace(assetUrlCode, "");
  url = url.replace(listDataCode, "");
  if (url.includes("data:image/svg+xml;base64")) {
    return [url.split(",")[0] + "," + url.split(",")[1], url.split(",")[2]];
  } else {
    return [url.split(",")[0], url.split(",")[1]];
  }
};
export const decodeListUrl = (url: string) => {
  url = url.substring(listDataCode.length, url.indexOf(listDataCode));
  return url;
};

/**
 * check if this is a correct address format
 */
export const checkAddress = (address: string) => {
  const rExp: RegExp = /^0x[a-fA-F0-9]{40}$/;
  if (!rExp.test(address)) throw new Error("Address is not correct");
  return address;
};

export function convertTo12HourFormat(utcTime: string): string {
  const date = new Date(utcTime);

  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  const amOrPm = hours >= 12 ? "下午" : "上午";

  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }

  const formattedTime = `${amOrPm} ${hours}:${minutes
    .toString()
    .padStart(2, "0")}`;
  return formattedTime;
}
