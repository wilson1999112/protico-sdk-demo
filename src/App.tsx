import { SUPPORTED_ADAPTERS } from "protico-sdk";
import "./App.css";
import { useProticoAuth } from "./hooks/useProticoAuth";
import { Navigate, Outlet, Link, useLoaderData } from "react-router-dom";
import { DomainData, getLobbies } from "./utils/lobbies";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { IconButton } from "@mui/material";
function App() {
  const { domain, lobbies } = useLoaderData() as DomainData;
  const { logout, chainId, address, connectedAdapterName } = useProticoAuth();

  if (!connectedAdapterName) return <Navigate replace to="/login" />;

  return (
    <div className="flex flex-row w-screen h-screen">
      <div
        id="sidebar"
        className="h-screen basis-56 overflow-hidden flex flex-col bg-[#19171d]"
      >
        <header className="basis-12 w-full border-b-[1px] border-[#312f34] flex flex-col justify-center">
          <Link to={`/`}>
            <h2 className="pl-4 text-md text-white">{domain}</h2>
          </Link>
        </header>
        <nav className="flex-1 overflow-y-scroll">
          {lobbies.length ? (
            <ul>
              {lobbies.map((lobby) => (
                <li key={lobby.id}>
                  {lobby.url ? (
                    <div className="w-full px-4">
                      <Link to={`lobby/${lobby.id}`}>
                        <p className="text-sm leading-8 line-clamp-1 text-start">
                          {lobby.url}
                        </p>
                      </Link>
                    </div>
                  ) : (
                    <i>No Url</i>
                  )}{" "}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No Lobbies</i>
            </p>
          )}
        </nav>
        <div className="basis-12 border-t-[1px] border-[#312f34] rounded-lg flex flex-row items-center">
          <p className="flex-1 font-light text-sm pl-4 leading-8 line-clamp-1 text-start">
            {address ?? "No Address"}
          </p>
          <div className="basis-10 flex flex-row justify-center">
            <IconButton onClick={() => logout()}>
              <ExpandMoreIcon
                sx={{
                  width: 20,
                  height: 20,
                  color: "white",
                }}
              />
            </IconButton>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-red-50 min-w-[200px]">
        <Outlet />
      </div>
    </div>
  );
}

export default App;

export async function loader() {
  const domain = "localhost:4000";
  const lobbies = await getLobbies(domain);
  return { domain, lobbies };
}
