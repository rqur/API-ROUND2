import { useHistory } from "react-router-dom";
import React from "react";
import "./GroupCard.css";
import useme from "./useme.svg";
const CustomGroupCard = ({ customGroup }) => {
  const history = useHistory();

  const handleClick = () => {
    history.push(`/groups/${customGroup.id}`);
  };

  return (
    <article className="custom-group-card" onClick={handleClick}>
      <div className="custom-group-card__image">
        <img src={useme} alt="useme" />
      </div>
      <header className="custom-group-card__header">
        <h2 className="custom-group-card__title">{customGroup.name}</h2>
        <p className="custom-group-card__location">
          {customGroup.city}, {customGroup.state}
        </p>
        <p className="custom-group-card__about">{customGroup.about}</p>
        <div className="custom-group-card__footer">
          <p>Events</p>
          <p>{customGroup.private ? "Private" : "Public"}</p>
        </div>
      </header>
    </article>
  );
};

export default CustomGroupCard;
