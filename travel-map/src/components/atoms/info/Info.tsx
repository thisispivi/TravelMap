import { ReactComponent as InfoIcon } from "../../../icons/Info.svg";
import { ReactComponent as GithubIcon } from "../../../icons/Github.svg";
import { ReactComponent as LinkedinIcon } from "../../../icons/Linkedin.svg";
import { ReactComponent as PortfolioIcon } from "../../../icons/Portfolio.svg";
import "./Info.scss";
import { Backdrop } from "../backdrop/Backdrop";
import { useTranslation } from "react-i18next";

interface InfoProps {
  className?: string;
  isOpened?: boolean;
  setIsOpened?: (isOpened: boolean) => void;
}

export function Info({
  className = "",
  isOpened = false,
  setIsOpened = () => {},
}: InfoProps) {
  const { t } = useTranslation(["home"]);
  const handleToggle = () => setIsOpened(!isOpened);
  return (
    <>
      {isOpened && <Backdrop onClick={handleToggle} visible={false} />}
      <div className={`info ${isOpened ? "info-active" : ""}`}>
        <div className="title">
          <InfoIcon onClick={handleToggle} className="info-icon" />
          {isOpened && <h3>Info</h3>}
        </div>
        <div className={`info-content`}>
          <div className="info-content-text">
            <div className="profile">
              <a href="https://github.com/thisispivi">
                <img
                  src="https://avatars.githubusercontent.com/u/37103053?v=4"
                  alt="profile"
                />
              </a>
            </div>
            <div>
              <p>{t("first")}</p>
              <p>{t("second")}</p>
            </div>
          </div>
          <div className="info-content-footer">
            <a href="https://github.com/thisispivi">
              <GithubIcon />
            </a>
            <a href="https://www.linkedin.com/in/andrea-piras-pivi/">
              <LinkedinIcon />
            </a>
            <a href="https://github.com/thisispivi">
              <PortfolioIcon />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
