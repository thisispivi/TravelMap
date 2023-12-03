import { ReactComponent as InfoIcon } from "../../../icons/Info.svg";
import { ReactComponent as GithubIcon } from "../../../icons/Github.svg";
import { ReactComponent as LinkedinIcon } from "../../../icons/Linkedin.svg";
import { ReactComponent as PortfolioIcon } from "../../../icons/Portfolio.svg";
import "./Info.scss";
import { Backdrop } from "../backdrop/Backdrop";
import { useTranslation } from "react-i18next";
import { CloseButton } from "../button/Button";

interface InfoProps {
  className?: string;
  isOpened?: number;
  setIsOpened?: () => void;
}

export function Info({
  className = "",
  isOpened = 0,
  setIsOpened = () => {
    return;
  },
}: InfoProps) {
  const { t } = useTranslation(["home"]);
  const handleToggle = () => setIsOpened();
  return (
    <>
      {isOpened > 0 && <Backdrop onClick={handleToggle} isVisible={false} />}
      <div className={`info ${className} ${isOpened > 0 ? "info-active" : ""}`}>
        <div className="title">
          <InfoIcon onClick={handleToggle} className="info-icon" />
          {isOpened > 0 && <h3>Info</h3>}
          {isOpened > 0 && <CloseButton onClick={handleToggle} />}
        </div>
        {isOpened === 2 && (
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
        )}
      </div>
    </>
  );
}
