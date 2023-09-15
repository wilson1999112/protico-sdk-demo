import useSWR from "swr";
import { getProticoCeramicClient } from "../utils/ceramic";
import { DEFAULT_PROFILE } from "protico-sdk";

const fetcher = async (address: string) => {
  try {
    const basicProfile =
      (await getProticoCeramicClient().profile.get(address)) ?? DEFAULT_PROFILE;
    return basicProfile;
  } catch (error) {
    console.log(error);
    return DEFAULT_PROFILE;
  }
};

const useBasicProfile = (address: string | null) => {
  const { data, error } = useSWR(!!address ? address : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    basicProfile: data,
    isLoading: !error && !data,
    isError: error,
  };
};
export default useBasicProfile;
