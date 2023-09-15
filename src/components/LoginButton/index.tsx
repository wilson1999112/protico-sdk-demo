import PersonIcon from "@mui/icons-material/Person";
interface ILoginButtonProps {
  buttonText: string;
  imgSrc?: string;
  bgColor: "walletconnectblack" | "metamaskorange" | "guestblue";
  onClick: () => void;
}
export default function LoginButton({
  buttonText,
  imgSrc,
  bgColor,
  onClick,
}: ILoginButtonProps) {
  const bgColorClassname =
    bgColor === "walletconnectblack"
      ? "bg-walletconnectblack"
      : bgColor === "metamaskorange"
      ? "bg-metamaskorange"
      : "bg-guestblue";
  return (
    <div
      className={
        `flex flex-row rounded-sm w-48 h-11 m-3 overflow-hidden relative hover:shadow-sm hover:shadow-[var(--button-hover-blue)] cursor-pointer ` +
        bgColorClassname
      }
      onClick={onClick}
    >
      <div className="basis-10 h-full bg-transparent flex justify-center items-center transparent-icon-wrapper">
        {!!imgSrc ? (
          <img className="w-[18px] h-[18px]" src={imgSrc} />
        ) : (
          <PersonIcon className="w-[18px] h-[18px]" />
        )}
      </div>
      <p className="flex-1 text-sm tracking-wide h-full flex flex-col justify-center items-center">
        <b>{buttonText}</b>
      </p>
    </div>
  );
}
